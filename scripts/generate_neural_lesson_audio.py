#!/usr/bin/env python3
"""Generate SoberMind lesson audio with DeepSeek scripts + Edge neural TTS + ffmpeg mastering."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "src" / "data"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_local_env() -> None:
    for name in [".env.local", ".env"]:
        path = ROOT_DIR / name
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            key = key.strip()
            value = value.strip().strip("'\"")
            if key and key not in os.environ:
                os.environ[key] = value


def load_lessons() -> List[Dict[str, Any]]:
    main_lessons = read_json(DATA_DIR / "lessons.json")
    advanced_path = DATA_DIR / "lessons_v2_shengguan.json"
    advanced_lessons = read_json(advanced_path) if advanced_path.exists() else []
    base_day = len(main_lessons)
    normalized_advanced = [
        {**lesson, "day_number": base_day + index + 1}
        for index, lesson in enumerate(advanced_lessons)
    ]
    return sorted([*main_lessons, *normalized_advanced], key=lambda item: item["day_number"])


def select_lessons(lessons: Iterable[Dict[str, Any]], args: argparse.Namespace) -> List[Dict[str, Any]]:
    selected = []
    for lesson in lessons:
        day = int(lesson["day_number"])
        if args.day and day != args.day:
            continue
        if args.from_day and day < args.from_day:
            continue
        if args.to_day and day > args.to_day:
            continue
        selected.append(lesson)
    return selected


def pad_day(day: int) -> str:
    return f"{int(day):03d}"


def spoken_chars(text: str) -> int:
    return len(re.sub(r"\s+", "", text or ""))


def strip_markdown(text: str) -> str:
    value = str(text or "")
    value = re.sub(r"^#{1,6}\s*", "", value, flags=re.MULTILINE)
    value = re.sub(r"\*\*(.*?)\*\*", r"\1", value)
    value = re.sub(r"\*(.*?)\*", r"\1", value)
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = re.sub(r"\[(.*?)\]\((.*?)\)", r"\1", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def clean_script(text: str) -> str:
    value = strip_markdown(text)
    value = re.sub(r"[#*_`>\[\]{}]", "", value)
    value = re.sub(r"\s+", " ", value)
    value = value.replace("“", "").replace("”", "")
    return value.strip(" \n\t\"'")


def compress_to_limit(text: str, max_chars: int) -> str:
    if spoken_chars(text) <= max_chars:
        return text
    parts = re.split(r"(?<=[。！？；])", text)
    output = ""
    for part in parts:
        if not part:
            continue
        if spoken_chars(output + part) > max_chars:
            break
        output += part
    return output.strip() or text[:max_chars]


def build_template_script(lesson: Dict[str, Any], min_chars: int, max_chars: int) -> str:
    title = lesson.get("title", "")
    category = lesson.get("category", "")
    content = clean_script(lesson.get("content", ""))
    question = clean_script(lesson.get("question", ""))
    exercise = ""
    exercises = lesson.get("exercises") or []
    if exercises:
        exercise = clean_script(exercises[0].get("instruction", ""))

    text = (
        f"欢迎来到清醒研究院。今天是第 {lesson['day_number']} 课，《{title}》。"
        f"这一课属于{category}模块，核心不是记住一句道理，而是把它放进今天的生活。"
        f"{content}"
        f"听完后请做一个小练习：{exercise or '找一个最小行动，马上完成它'}。"
        f"最后用这个问题复盘自己：{question or '我今天能做出哪一个更清醒的选择？'}"
    )
    text = compress_to_limit(clean_script(text), max_chars)
    if spoken_chars(text) < min_chars:
        text = f"{text} 请暂停三十秒，把答案写下来。真正的学习，从你开始行动的那一刻发生。"
    return compress_to_limit(clean_script(text), max_chars)


def build_deepseek_prompt(lesson: Dict[str, Any], min_chars: int, max_chars: int) -> str:
    exercises = lesson.get("exercises") or []
    exercise_text = "\n".join(
        f"- {item.get('instruction', '')}；目的：{item.get('purpose', '')}"
        for item in exercises[:2]
    )
    return f"""
你是“清醒研究院”的中文男声课程口播稿编辑。
请把下面课程压缩成一段自然、沉稳、有老师讲课感的口播导入稿。

要求：
1. 中文 {min_chars}-{max_chars} 字左右。
2. 不要写标题、编号、Markdown、括号说明。
3. 不要逐字复述正文，要像老师在开场讲课。
4. 结构包含：课程定位、核心洞察、一个行动练习或复盘问题。
5. 语气稳重、克制、有陪伴感，适合 zh-CN-YunyangNeural 男声慢速朗读。
6. 不要模仿任何具体人物或机构，只保持学院式课程讲解感。

课程：
Day {lesson.get('day_number')}：{lesson.get('title')}
分类：{lesson.get('category')}
摘要：{lesson.get('content')}
引语：{lesson.get('quote')} —— {lesson.get('quote_author')}
练习：
{exercise_text}
反思问题：{lesson.get('question')}
""".strip()


def call_deepseek(prompt: str, model: str, timeout: int, retries: int) -> str:
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        raise RuntimeError("DEEPSEEK_API_KEY is required when --script-provider=deepseek.")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "你只输出可直接朗读的中文课程口播稿。"},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.45,
        "max_tokens": 420,
    }
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        "https://api.deepseek.com/chat/completions",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    last_error: Optional[Exception] = None
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                body = json.loads(response.read().decode("utf-8"))
            return body["choices"][0]["message"]["content"]
        except (urllib.error.URLError, KeyError, IndexError, json.JSONDecodeError) as error:
            last_error = error
            if attempt < retries:
                time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"DeepSeek request failed: {last_error}")


def build_script(lesson: Dict[str, Any], args: argparse.Namespace) -> str:
    provider = args.script_provider
    if provider == "auto":
        provider = "deepseek" if os.environ.get("DEEPSEEK_API_KEY") else "template"

    if provider == "deepseek":
        prompt = build_deepseek_prompt(lesson, args.min_chars, args.max_chars)
        text = call_deepseek(prompt, args.deepseek_model, args.timeout, args.retries)
    else:
        text = build_template_script(lesson, args.min_chars, args.max_chars)

    text = clean_script(text)
    return compress_to_limit(text, args.max_chars)


def run(command: List[str]) -> None:
    result = subprocess.run(command, text=True, capture_output=True)
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip()
        raise RuntimeError(f"{command[0]} failed: {detail}")


async def edge_tts_to_mp3(text: str, raw_path: Path, voice: str, rate: str, pitch: str) -> None:
    try:
        import edge_tts
    except Exception as error:  # pragma: no cover - dependency availability check
        raise RuntimeError("edge_tts is not installed. Run: python3 -m pip install edge-tts") from error

    communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await communicate.save(str(raw_path))


async def generate_audio(text: str, output_path: Path, args: argparse.Namespace) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="sobermind-neural-") as temp_dir:
        raw_path = Path(temp_dir) / "raw.mp3"
        mastered_path = Path(temp_dir) / "mastered.mp3"
        await edge_tts_to_mp3(text, raw_path, args.voice, args.rate, args.pitch)
        run([
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(raw_path),
            "-af",
            "loudnorm=I=-16:TP=-1.5:LRA=9",
            "-ar",
            str(args.sample_rate),
            "-ac",
            "1",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            args.bitrate,
            str(mastered_path),
        ])
        mastered_path.replace(output_path)


def estimate_duration_seconds(text: str, chars_per_minute: int = 210) -> int:
    return max(1, round(spoken_chars(text) / chars_per_minute * 60))


def format_duration(seconds: int) -> str:
    minutes = seconds // 60
    rest = seconds % 60
    return f"{minutes}:{rest:02d}"


def display_path(path: Path) -> str:
    return os.path.relpath(path, ROOT_DIR)


async def main() -> None:
    load_local_env()
    args = parse_args()
    lessons = select_lessons(load_lessons(), args)
    if not lessons:
        raise RuntimeError("No lessons matched the requested range.")

    out_dir = (ROOT_DIR / args.out).resolve()
    scripts_dir = (ROOT_DIR / args.scripts).resolve()
    manifest_path = (ROOT_DIR / args.manifest).resolve()
    scripts_dir.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    items = []
    for index, lesson in enumerate(lessons, start=1):
        day = pad_day(int(lesson["day_number"]))
        script_path = scripts_dir / f"day-{day}.txt"
        output_path = out_dir / f"day-{day}.mp3"

        if args.reuse_scripts and script_path.exists():
            text = script_path.read_text(encoding="utf-8").strip()
        else:
            text = build_script(lesson, args)
            script_path.write_text(f"{text}\n", encoding="utf-8")

        generated = False
        skipped = False
        if args.write:
            if output_path.exists() and not args.force:
                skipped = True
            else:
                await generate_audio(text, output_path, args)
                generated = True

        duration = estimate_duration_seconds(text)
        items.append({
            "day_number": lesson["day_number"],
            "title": lesson.get("title", ""),
            "category": lesson.get("category", ""),
            "scriptProvider": args.script_provider,
            "ttsProvider": "edge_tts",
            "voice": args.voice,
            "voiceLabel": "YunyangNeural 男声",
            "rate": args.rate,
            "pitch": args.pitch,
            "format": "mp3",
            "bitrate": args.bitrate,
            "sampleRate": args.sample_rate,
            "channels": 1,
            "scriptFile": display_path(script_path),
            "file": display_path(output_path),
            "urlPath": f"/audio/lessons/day-{day}.mp3",
            "chars": spoken_chars(text),
            "estimatedDurationSeconds": duration,
            "estimatedDuration": format_duration(duration),
            "generated": generated,
            "skipped": skipped,
        })
        action = "Generated" if generated else "Skipped" if skipped else "Scripted"
        print(f"[{index}/{len(lessons)}] {action} {display_path(output_path)} ({spoken_chars(text)} chars)")
        if args.delay and index < len(lessons):
            await asyncio.sleep(args.delay)

    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "pipeline": "deepseek-script.edge-tts.ffmpeg-loudnorm",
        "mode": "neural",
        "scriptProvider": args.script_provider,
        "ttsProvider": "edge_tts",
        "voice": args.voice,
        "voiceLabel": "YunyangNeural 男声",
        "rate": args.rate,
        "pitch": args.pitch,
        "format": "mp3",
        "bitrate": args.bitrate,
        "sampleRate": args.sample_rate,
        "channels": 1,
        "loudnorm": "I=-16:TP=-1.5:LRA=9",
        "dryRun": not args.write,
        "total": len(items),
        "items": items,
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote manifest to {display_path(manifest_path)}.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate neural lesson audio.")
    parser.add_argument("--day", type=int)
    parser.add_argument("--from", dest="from_day", type=int)
    parser.add_argument("--to", dest="to_day", type=int)
    parser.add_argument("--write", action="store_true", help="Generate MP3 files. Without this, only scripts and manifest are written.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing MP3 files.")
    parser.add_argument("--reuse-scripts", action="store_true", help="Reuse existing script files instead of requesting/generating scripts.")
    parser.add_argument("--script-provider", choices=["deepseek", "template", "auto"], default="deepseek")
    parser.add_argument("--deepseek-model", default=os.environ.get("DEEPSEEK_MODEL", "deepseek-chat"))
    parser.add_argument("--voice", default=os.environ.get("EDGE_TTS_VOICE", "zh-CN-YunyangNeural"))
    parser.add_argument("--rate", default=os.environ.get("EDGE_TTS_RATE", "-7%"))
    parser.add_argument("--pitch", default=os.environ.get("EDGE_TTS_PITCH", "-2Hz"))
    parser.add_argument("--bitrate", default=os.environ.get("AUDIO_BITRATE", "48k"))
    parser.add_argument("--sample-rate", type=int, default=int(os.environ.get("AUDIO_SAMPLE_RATE", "24000")))
    parser.add_argument("--min-chars", type=int, default=150)
    parser.add_argument("--max-chars", type=int, default=230)
    parser.add_argument("--timeout", type=int, default=45)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--delay", type=float, default=0.2)
    parser.add_argument("--out", default="public/audio/lessons")
    parser.add_argument("--scripts", default="audio/scripts/neural")
    parser.add_argument("--manifest", default="public/audio/manifest.json")
    return parser.parse_args()


if __name__ == "__main__":
    asyncio.run(main())
