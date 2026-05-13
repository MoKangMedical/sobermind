const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
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

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}${stderr ? `: ${stderr}` : ''}`));
      }
    });
  });
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest < 10 ? `0${rest}` : rest}`;
}

async function generateOne({ lesson, text, outputPath, voice, rate, bitrate, force }) {
  if (!force && fs.existsSync(outputPath)) {
    return { skipped: true };
  }

  ensureDir(path.dirname(outputPath));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sobermind-audio-'));
  const textPath = path.join(tempDir, 'script.txt');
  const aiffPath = path.join(tempDir, `day-${padDay(lesson.day_number)}.aiff`);

  try {
    fs.writeFileSync(textPath, `${text}\n`, 'utf8');
    await run('say', ['-v', voice, '-r', String(rate), '-f', textPath, '-o', aiffPath]);
    await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', String(bitrate), aiffPath, outputPath]);
    return { skipped: false };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const mode = String(options.mode || 'guide');
  const outDir = path.resolve(rootDir, options.out || 'public/audio/lessons');
  const manifestPath = path.resolve(rootDir, options.manifest || 'public/audio/manifest.json');
  const scriptDir = path.resolve(rootDir, options.scripts || `audio/scripts/${mode}`);
  const voice = String(options.voice || process.env.APPLE_TTS_VOICE || 'Reed (中文（中国大陆）)');
  const rate = Number(options.rate || process.env.APPLE_TTS_RATE || 155);
  const bitrate = Number(options.bitrate || process.env.APPLE_TTS_BITRATE || 64000);
  const force = Boolean(options.force);
  const writeFiles = Boolean(options.write);
  const lessons = selectLessons(loadLessons(), options);

  if (!lessons.length) {
    throw new Error('No lessons matched the requested range.');
  }

  ensureDir(outDir);
  ensureDir(scriptDir);
  ensureDir(path.dirname(manifestPath));

  const manifest = {
    generatedAt: new Date().toISOString(),
    provider: 'apple-say',
    mode,
    voice,
    voiceLabel: '自然男声',
    rate,
    bitrate,
    format: 'm4a',
    dryRun: !writeFiles,
    total: lessons.length,
    items: [],
  };

  for (let index = 0; index < lessons.length; index += 1) {
    const lesson = lessons[index];
    const day = padDay(lesson.day_number);
    const fileName = `day-${day}.m4a`;
    const scriptName = `day-${day}.txt`;
    const outputPath = path.join(outDir, fileName);
    const scriptPath = path.join(scriptDir, scriptName);
    const text = buildAudioText(lesson, mode);
    const estimatedDurationSeconds = estimateDurationSeconds(text, 230);

    fs.writeFileSync(scriptPath, `${text}\n`, 'utf8');

    const item = {
      day_number: lesson.day_number,
      title: lesson.title,
      category: lesson.category,
      mode,
      scriptFile: path.relative(rootDir, scriptPath),
      file: path.relative(rootDir, outputPath),
      urlPath: `/audio/lessons/${fileName}`,
      chars: text.replace(/\s/g, '').length,
      estimatedDurationSeconds,
      estimatedDuration: formatDuration(estimatedDurationSeconds),
      generated: false,
      skipped: false,
    };

    if (writeFiles) {
      const result = await generateOne({ lesson, text, outputPath, voice, rate, bitrate, force });
      item.generated = fs.existsSync(outputPath);
      item.skipped = result.skipped;
      console.log(`[${index + 1}/${lessons.length}] ${result.skipped ? 'Skipped' : 'Generated'} ${item.file}`);
    } else {
      console.log(`[${index + 1}/${lessons.length}] Dry run ${item.file} (${item.chars} chars)`);
    }

    manifest.items.push(item);
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote manifest to ${path.relative(rootDir, manifestPath)}.`);
  if (!writeFiles) {
    console.log('Add --write to generate M4A files.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
