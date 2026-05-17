const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'src', 'data');
const miniDir = path.join(rootDir, 'miniprogram');
const audioBaseUrl = normalizeBaseUrl(process.env.MINIPROGRAM_AUDIO_BASE_URL || '');
const audioPathPrefix = trimSlashes(process.env.LESSON_AUDIO_PATH_PREFIX || 'lessons');
const audioExtension = trimSlashes(process.env.LESSON_AUDIO_EXTENSION || 'mp3');
const audioVoiceLabel = process.env.LESSON_AUDIO_VOICE_LABEL || 'YunyangNeural 男声';

const categories = [
  { name: '知行合一', icon: '⚡', desc: '行动哲学' },
  { name: '情绪掌控', icon: '🧘', desc: '斯多葛哲学' },
  { name: '深度关系', icon: '🤝', desc: '人际关系' },
  { name: '自我觉察', icon: '🔍', desc: '正念冥想' },
  { name: '极简之道', icon: '🍃', desc: '断舍离' },
  { name: '逆境成长', icon: '🔥', desc: '反脆弱' },
  { name: '心流状态', icon: '💫', desc: '专注力' },
  { name: '复利思维', icon: '📈', desc: '长期主义' },
  { name: '感恩练习', icon: '🙏', desc: '积极心理学' },
  { name: '藏拙守拙', icon: '🎭', desc: '处世智慧' },
  { name: '高级生命观', icon: '🌌', desc: '系统运行' },
];

const lessonPackages = [
  { root: 'packages/lessons1', name: 'lessons1', min: 1, max: 85 },
  { root: 'packages/lessons2', name: 'lessons2', min: 86, max: 170 },
  { root: 'packages/lessons3', name: 'lessons3', min: 171, max: 255 },
  { root: 'packages/lessons4', name: 'lessons4', min: 256, max: 340 },
  { root: 'packages/lessons5', name: 'lessons5', min: 341, max: 425 },
];

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeModule(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `module.exports=${JSON.stringify(value)};\n`);
}

function writeLessonPackage(filePath, lessons) {
  ensureDir(path.dirname(filePath));
  const payload = JSON.stringify(lessons);
  const source = [
    `const lessons=${payload};`,
    '',
    'function getLessonByDay(day) {',
    '  return lessons.find((lesson) => lesson.day_number === Number(day));',
    '}',
    '',
    'module.exports = { lessons, getLessonByDay };',
    '',
  ].join('\n');
  fs.writeFileSync(filePath, source);
}

function trimSlashes(value) {
  return String(value || '').replace(/^\/+|\/+$/g, '');
}

function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/+$/g, '');
}

function padDay(day) {
  return `000${Number(day)}`.slice(-3);
}

function makeAudioMetadata(lesson) {
  const fileName = `day-${padDay(lesson.day_number)}.${audioExtension}`;
  const audioPath = audioPathPrefix ? `${audioPathPrefix}/${fileName}` : fileName;
  return {
    status: audioBaseUrl ? 'ready' : 'planned',
    voice: 'natural-male',
    voiceLabel: audioVoiceLabel,
    format: audioExtension,
    fileName,
    path: audioPath,
    url: audioBaseUrl ? `${audioBaseUrl}/${audioPath}` : '',
  };
}

function attachAudioMetadata(lesson) {
  return {
    ...lesson,
    audio: {
      ...makeAudioMetadata(lesson),
      ...(lesson.audio || {}),
    },
  };
}

function normalizeLessons() {
  const mainLessons = readJson('lessons.json');
  const advancedPath = path.join(dataDir, 'lessons_v2_shengguan.json');
  const advancedLessons = fs.existsSync(advancedPath) ? readJson('lessons_v2_shengguan.json') : [];
  const baseDay = mainLessons.length;
  const renumberedAdvanced = advancedLessons.map((lesson, index) => ({
    ...lesson,
    day_number: baseDay + index + 1,
  }));

  return [...mainLessons, ...renumberedAdvanced]
    .sort((a, b) => a.day_number - b.day_number)
    .map(attachAudioMetadata);
}

function makeSummary(lessons) {
  const lessonSummary = lessons.map((lesson) => ({
    day_number: lesson.day_number,
    title: lesson.title,
    category: lesson.category,
    content: lesson.content,
    audio: lesson.audio,
  }));

  const categorySummary = categories.map((category) => {
    const categoryLessons = lessons.filter((lesson) => lesson.category === category.name);
    const days = categoryLessons.map((lesson) => lesson.day_number).sort((a, b) => a - b);
    return {
      ...category,
      count: categoryLessons.length,
      firstDay: days[0] || null,
      lastDay: days[days.length - 1] || null,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalDays: lessons.length,
    lessonPackages,
    categories: categorySummary,
    lessons: lessonSummary,
  };
}

function main() {
  const lessons = normalizeLessons();
  const maxConfiguredDay = Math.max(...lessonPackages.map((item) => item.max));
  if (lessons.length > maxConfiguredDay) {
    throw new Error(`小程序分包只配置到 Day ${maxConfiguredDay}，当前课程数为 ${lessons.length}。请扩展 lessonPackages 和 app.json 分包配置。`);
  }

  writeModule(path.join(miniDir, 'data', 'summary.js'), makeSummary(lessons));

  lessonPackages.forEach((packageInfo) => {
    const packageLessons = lessons.filter((lesson) => lesson.day_number >= packageInfo.min && lesson.day_number <= packageInfo.max);
    writeLessonPackage(path.join(miniDir, packageInfo.root, 'data', 'lessons.js'), packageLessons);
  });

  console.log(`Generated ${lessons.length} lessons for WeChat Mini Program.`);
}

main();
