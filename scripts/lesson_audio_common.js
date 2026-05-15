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

function buildGuideNarrationText(lesson) {
  const actionPoints = Array.isArray(lesson.action_points)
    ? lesson.action_points.slice(0, 3).map((item, index) => `${index + 1}，${item}`).join('。')
    : '';
  const exercises = Array.isArray(lesson.exercises)
    ? lesson.exercises.slice(0, 2).map((exercise, index) => {
      const purpose = exercise.purpose ? `，目的，是${exercise.purpose}` : '';
      return `练习 ${index + 1}：${exercise.instruction}${purpose}`;
    }).join('。')
    : '';

  return [
    `第 ${lesson.day_number} 天，${lesson.title}。`,
    `今天的主题是，${lesson.category}。`,
    lesson.quote ? `今日引语：${lesson.quote}${lesson.quote_author ? `。${lesson.quote_author}` : ''}。` : '',
    cleanSpokenText(lesson.content),
    actionPoints ? `把今天的课程落实到行动里，可以从这三件小事开始：${cleanSpokenText(actionPoints)}。` : '',
    exercises ? `如果你有更完整的时间，可以做这两个练习。${cleanSpokenText(exercises)}。` : '',
    lesson.question ? `最后，把这个问题留给今天的自己：${cleanSpokenText(lesson.question)}。` : '',
    '不用急着一次做到完美。把一个清醒的选择，放进今天真实的生活里。',
  ].filter(Boolean).join('\n\n');
}

function buildAcademyNarrationText(lesson) {
  const actionPoints = Array.isArray(lesson.action_points)
    ? lesson.action_points.slice(0, 3).map((item, index) => `第 ${index + 1} 点，${item}`).join('。')
    : '';
  const exercises = Array.isArray(lesson.exercises)
    ? lesson.exercises.slice(0, 2).map((exercise, index) => {
      const purpose = exercise.purpose ? `这道题的目的，是${exercise.purpose}` : '';
      const time = exercise.time_estimate ? `建议用时${exercise.time_estimate}` : '';
      return `练习题 ${index + 1}：${exercise.instruction}。${purpose}。${time}。`;
    }).join('\n')
    : '';
  const criteria = lesson.self_assessment && Array.isArray(lesson.self_assessment.criteria)
    ? lesson.self_assessment.criteria.slice(0, 3).map((item, index) => `${index + 1}，${item}`).join('。')
    : '';

  return [
    `欢迎来到清醒研究院。今天是第 ${lesson.day_number} 课，主题是：${lesson.title}。`,
    `本课所在模块是：${lesson.category}。你可以把它当成一次十到十五分钟的学院式讲解。我们先讲框架，再讲案例，最后给出练习题。`,
    lesson.quote ? `先看今天的核心引语：${lesson.quote}${lesson.quote_author ? `。${lesson.quote_author}` : ''}。` : '',
    `第一部分，核心框架。${cleanSpokenText(lesson.content)}`,
    actionPoints ? `第二部分，行动抓手。今天最重要的三个执行点是：${cleanSpokenText(actionPoints)}。` : '',
    exercises ? `第三部分，交互练习。请你边听边暂停，或者在课程结束后完成。\n${cleanSpokenText(exercises)}` : '',
    criteria ? `第四部分，参考答案和自我检查。完成之后，用这三条标准判断自己是否真的学会：${cleanSpokenText(criteria)}。` : '',
    lesson.question ? `最后，留下今天的复盘问题：${cleanSpokenText(lesson.question)}。` : '',
    '这一课的目标不是让你记住更多概念，而是让你今天做出一个更清醒的选择。我们下一课继续。',
  ].filter(Boolean).join('\n\n');
}

function buildAudioText(lesson, mode = 'guide') {
  if (mode === 'full') {
    return buildNarrationText(lesson);
  }
  if (mode === 'academy') {
    return buildAcademyNarrationText(lesson);
  }
  return buildGuideNarrationText(lesson);
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
  buildGuideNarrationText,
  buildAcademyNarrationText,
  buildAudioText,
  estimateDurationSeconds,
  selectLessons,
  parseArgs,
};
