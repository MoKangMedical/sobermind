#!/usr/bin/env python3
"""Audit generated lesson MP3 files for web and mini-program delivery specs."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
from pathlib import Path
from typing import Any, Dict, List


ROOT_DIR = Path(__file__).resolve().parents[1]


def display_path(path: Path) -> str:
    return os.path.relpath(path, ROOT_DIR)


def run_ffprobe(path: Path) -> Dict[str, Any]:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration,bit_rate:stream=codec_name,sample_rate,channels,bit_rate",
            "-of",
            "json",
            str(path),
        ],
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"ffprobe failed for {path}")
    return json.loads(result.stdout)


def grade_audio(info: Dict[str, Any], min_duration: float, max_duration: float) -> Dict[str, Any]:
    stream = (info.get("streams") or [{}])[0]
    fmt = info.get("format") or {}
    codec = stream.get("codec_name")
    sample_rate = int(stream.get("sample_rate") or 0)
    channels = int(stream.get("channels") or 0)
    bit_rate = int(stream.get("bit_rate") or fmt.get("bit_rate") or 0)
    duration = float(fmt.get("duration") or 0)

    issues: List[str] = []
    if codec != "mp3":
        issues.append(f"codec={codec}")
    if sample_rate != 24000:
        issues.append(f"sample_rate={sample_rate}")
    if channels != 1:
        issues.append(f"channels={channels}")
    if not (44000 <= bit_rate <= 70000):
        issues.append(f"bit_rate={bit_rate}")
    if not (min_duration <= duration <= max_duration):
        issues.append(f"duration={duration:.3f}")

    grade = "A" if not issues else "B" if len(issues) <= 2 else "C"
    return {
        "grade": grade,
        "issues": issues,
        "codec": codec,
        "sampleRate": sample_rate,
        "channels": channels,
        "bitRate": bit_rate,
        "duration": round(duration, 3),
    }


def main() -> None:
    args = parse_args()
    audio_dir = (ROOT_DIR / args.dir).resolve()
    files = sorted(audio_dir.glob(args.pattern))
    if args.limit:
        files = files[: args.limit]

    results = []
    for path in files:
        try:
            item = grade_audio(run_ffprobe(path), args.min_duration, args.max_duration)
        except Exception as error:
            item = {"grade": "C", "issues": [str(error)]}
        item["file"] = display_path(path)
        results.append(item)

    summary = {
        "total": len(results),
        "A": sum(1 for item in results if item["grade"] == "A"),
        "B": sum(1 for item in results if item["grade"] == "B"),
        "C": sum(1 for item in results if item["grade"] == "C"),
    }
    print(json.dumps({"summary": summary, "items": results}, ensure_ascii=False, indent=2))

    if args.fail_on_non_a and summary["B"] + summary["C"] > 0:
        raise SystemExit(1)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit neural lesson audio MP3 files.")
    parser.add_argument("--dir", default="public/audio/lessons")
    parser.add_argument("--pattern", default="day-*.mp3")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--min-duration", type=float, default=20)
    parser.add_argument("--max-duration", type=float, default=75)
    parser.add_argument("--fail-on-non-a", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    main()
