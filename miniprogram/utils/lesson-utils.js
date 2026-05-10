const summary = require('../data/summary');

function getTotalDays() {
  return summary.totalDays || summary.lessons.length;
}

function getTodayDayNumber() {
  const start = new Date(2026, 0, 1);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((startOfDay(now).getTime() - start.getTime()) / dayMs);
  const total = getTotalDays();
  return ((diffDays % total) + total) % total + 1;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function findLessonSummary(day) {
  return summary.lessons.find((lesson) => lesson.day_number === Number(day));
}

function getLessonsByCategory(categoryName) {
  return summary.lessons
    .filter((lesson) => lesson.category === categoryName)
    .sort((a, b) => a.day_number - b.day_number);
}

function findCategory(categoryName) {
  return summary.categories.find((category) => category.name === categoryName);
}

function getPackageForDay(day) {
  const dayNumber = Number(day);
  return summary.lessonPackages.find((item) => dayNumber >= item.min && dayNumber <= item.max);
}

function getLessonPath(day) {
  const packageInfo = getPackageForDay(day);
  if (!packageInfo) {
    return '';
  }
  return `/${packageInfo.root}/pages/lesson/lesson?day=${Number(day)}`;
}

function navigateToLesson(day, mode = 'navigateTo') {
  const url = getLessonPath(day);
  if (!url) {
    wx.showToast({ title: '课程不存在', icon: 'none' });
    return;
  }

  wx[mode]({
    url,
    fail() {
      wx.navigateTo({ url });
    },
  });
}

module.exports = {
  categories: summary.categories,
  lessons: summary.lessons,
  getTotalDays,
  getTodayDayNumber,
  findLessonSummary,
  getLessonsByCategory,
  findCategory,
  getLessonPath,
  navigateToLesson,
};
