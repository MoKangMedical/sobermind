const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'src', 'data');

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'));
}

function loadLessons() {
  const mainLessons = readJson('lessons.json');
  const advancedPath = path.join(dataDir, 'lessons_v2_shengguan.json');
  const advancedLessons = fs.existsSync(advancedPath) ? readJson('lessons_v2_shengguan.json') : [];
  const baseDay = mainLessons.length;
  return [
    ...mainLessons,
    ...advancedLessons.map((lesson, index) => ({
      ...lesson,
      day_number: baseDay + index + 1,
    })),
  ].sort((a, b) => a.day_number - b.day_number);
}

function padDay(day) {
  return `000${Number(day)}`.slice(-3);
}

function stripMarkdown(text) {
  return String(text || '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanSpokenText(text) {
  return stripMarkdown(text)
    .replace(/[🎯⏱✅📝💭🤔💡🧠⚡🧘🤝🔍🍃🔥💫📈🙏🎭🌌]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function buildNarrationText(lesson) {
  const exercises = (lesson.exercises || [])
    .map((exercise, index) => [
      `练习 ${index + 1}：${exercise.instruction}`,
      exercise.purpose ? `目的：${exercise.purpose}` : '',
      exercise.time_estimate ? `预计用时：${exercise.time_estimate}` : '',
    ].filter(Boolean).join('。'))
    .join('\n\n');

  const criteria = lesson.self_assessment && Array.isArray(lesson.self_assessment.criteria)
    ? lesson.self_assessment.criteria.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : '';

  return [
    `第 ${lesson.day_number} 天：${lesson.title}`,
    `分类：${lesson.category}`,
    lesson.quote ? `今日引语：${lesson.quote}${lesson.quote_author ? `。${lesson.quote_author}` : ''}` : '',
    cleanSpokenText(lesson.reading),
    cleanSpokenText(lesson.body),
    cleanSpokenText(lesson.closing),
    exercises ? `今日练习：\n${cleanSpokenText(exercises)}` : '',
    criteria ? `自我考核：\n${cleanSpokenText(criteria)}` : '',
    lesson.question ? `今日反思：${cleanSpokenText(lesson.question)}` : '',
  ].filter(Boolean).join('\n\n');
}

function estimateDurationSeconds(text, charsPerMinute = 230) {
  const chars = String(text || '').replace(/\s/g, '').length;
  return Math.max(1, Math.round((chars / charsPerMinute) * 60));
}

function selectLessons(lessons, options) {
  const day = options.day ? Number(options.day) : null;
  const from = options.from ? Number(options.from) : null;
  const to = options.to ? Number(options.to) : null;

  return lessons.filter((lesson) => {
    if (day) {
      return lesson.day_number === day;
    }
    if (from && lesson.day_number < from) {
      return false;
    }
    if (to && lesson.day_number > to) {
      return false;
    }
    return true;
  });
}

function parseArgs(argv) {
  return argv.reduce((acc, arg) => {
    if (arg.startsWith('--') && arg.includes('=')) {
      const [key, ...parts] = arg.slice(2).split('=');
      acc[key] = parts.join('=');
      return acc;
    }
    if (arg.startsWith('--')) {
      acc[arg.slice(2)] = true;
    }
    return acc;
  }, {});
}

module.exports = {
  rootDir,
  loadLessons,
  padDay,
  buildNarrationText,
  estimateDurationSeconds,
  selectLessons,
  parseArgs,
};
