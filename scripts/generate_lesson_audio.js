const fs = require('fs');
const path = require('path');
const {
  rootDir,
  loadLessons,
  padDay,
  buildAudioText,
  estimateDurationSeconds,
  selectLessons,
  parseArgs,
} = require('./lesson_audio_common');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadLocalEnv() {
  ['.env.local', '.env'].forEach((fileName) => {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) {
      return;
    }
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        return;
      }
      const index = trimmed.indexOf('=');
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesizeWithOpenAI({ input, outputPath, voice, model }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for audio generation.');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice,
      input,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TTS request failed (${response.status}): ${body}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, audioBuffer);
}

async function main() {
  loadLocalEnv();
  const options = parseArgs(process.argv.slice(2));
  const writeFiles = Boolean(options.write);
  const outDir = path.resolve(rootDir, options.out || 'audio/output/lessons');
  const manifestPath = path.resolve(rootDir, options.manifest || 'audio/output/manifest.json');
  const mode = String(options.mode || 'guide');
  const voice = String(options.voice || process.env.OPENAI_TTS_VOICE || process.env.TTS_VOICE || 'onyx');
  const model = String(options.model || process.env.OPENAI_TTS_MODEL || process.env.TTS_MODEL || 'tts-1-hd');
  const delayMs = Number(options.delay || 800);
  const lessons = selectLessons(loadLessons(), options);

  if (!lessons.length) {
    throw new Error('No lessons matched the requested range.');
  }

  ensureDir(outDir);
  ensureDir(path.dirname(manifestPath));

  const manifest = {
    generatedAt: new Date().toISOString(),
    provider: 'openai',
    model,
    voice,
    voiceLabel: '自然男声',
    mode,
    dryRun: !writeFiles,
    total: lessons.length,
    items: [],
  };

  for (const lesson of lessons) {
    const text = buildAudioText(lesson, mode);
    const fileName = `day-${padDay(lesson.day_number)}.mp3`;
    const outputPath = path.join(outDir, fileName);
    const item = {
      day_number: lesson.day_number,
      title: lesson.title,
      category: lesson.category,
      file: path.relative(rootDir, outputPath),
      chars: text.replace(/\s/g, '').length,
      estimatedDurationSeconds: estimateDurationSeconds(text),
      generated: false,
    };

    if (writeFiles) {
      await synthesizeWithOpenAI({ input: text, outputPath, voice, model });
      item.generated = true;
      console.log(`Generated ${item.file}`);
      await sleep(delayMs);
    } else {
      console.log(`Dry run: ${item.file} (${item.chars} chars)`);
    }

    manifest.items.push(item);
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote manifest to ${path.relative(rootDir, manifestPath)}.`);
  if (!writeFiles) {
    console.log('Add --write to generate MP3 files.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
