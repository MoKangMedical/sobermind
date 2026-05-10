const fs = require('fs');
const path = require('path');
const {
  rootDir,
  loadLessons,
  padDay,
  buildNarrationText,
  estimateDurationSeconds,
  selectLessons,
  parseArgs,
} = require('./lesson_audio_common');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest < 10 ? `0${rest}` : rest}`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(rootDir, options.out || 'audio/scripts');
  const manifestPath = path.resolve(rootDir, options.manifest || 'audio/manifest.json');
  const lessons = selectLessons(loadLessons(), options);

  if (!lessons.length) {
    throw new Error('No lessons matched the requested range.');
  }

  ensureDir(outDir);
  ensureDir(path.dirname(manifestPath));

  const items = lessons.map((lesson) => {
    const fileName = `day-${padDay(lesson.day_number)}.txt`;
    const scriptPath = path.join(outDir, fileName);
    const text = buildNarrationText(lesson);
    fs.writeFileSync(scriptPath, `${text}\n`, 'utf8');
    const estimatedDurationSeconds = estimateDurationSeconds(text);

    return {
      day_number: lesson.day_number,
      title: lesson.title,
      category: lesson.category,
      voice: 'natural-male',
      voiceLabel: '自然男声',
      scriptFile: path.relative(rootDir, scriptPath),
      audioFile: `lessons/day-${padDay(lesson.day_number)}.mp3`,
      chars: text.replace(/\s/g, '').length,
      estimatedDurationSeconds,
      estimatedDuration: formatDuration(estimatedDurationSeconds),
    };
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    total: items.length,
    items,
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`Generated ${items.length} narration scripts in ${path.relative(rootDir, outDir)}.`);
  console.log(`Wrote manifest to ${path.relative(rootDir, manifestPath)}.`);
}

main();
