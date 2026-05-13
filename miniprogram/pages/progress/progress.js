const lessonUtils = require('../../utils/lesson-utils');
const commerce = require('../../utils/commerce');

function getDateKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function getCurrentStreak(completed) {
  const activeDays = new Set(Object.values(completed).map(getDateKey));
  const cursor = new Date();
  let streak = 0;

  while (activeDays.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

Page({
  data: {
    totalDays: 0,
    completedCount: 0,
    progressPercent: 0,
    streak: 0,
    today: 1,
    todayLesson: null,
    membership: null,
    journey: [],
  },

  onShow() {
    const completed = wx.getStorageSync('completedLessons') || {};
    const completedCount = Object.keys(completed).length;
    const totalDays = lessonUtils.getTotalDays();
    const today = lessonUtils.getTodayDayNumber();

    this.setData({
      totalDays,
      completedCount,
      progressPercent: totalDays ? Math.round((completedCount / totalDays) * 100) : 0,
      streak: getCurrentStreak(completed),
      today,
      todayLesson: lessonUtils.findLessonSummary(today),
      membership: commerce.getMembership(),
      journey: [
        { index: '01', title: '听导读', desc: '2-3 分钟进入主题' },
        { index: '02', title: '读正文', desc: '完整吸收课程内容' },
        { index: '03', title: '做练习', desc: '把知识转成行为' },
        { index: '04', title: '写反思', desc: '形成个人反馈' },
        { index: '05', title: '完成打卡', desc: '进入下一课' },
      ],
    });
  },

  openToday() {
    lessonUtils.navigateToLesson(this.data.today);
  },

  openMembership() {
    wx.navigateTo({ url: '/pages/membership/membership' });
  },
});
