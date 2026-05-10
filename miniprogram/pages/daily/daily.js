const lessonUtils = require('../../utils/lesson-utils');
const auth = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    today: 1,
    todayLesson: null,
    progressText: '',
    loginStatusText: '登录中',
  },

  onShow() {
    const today = lessonUtils.getTodayDayNumber();
    const lesson = lessonUtils.findLessonSummary(today);
    const completed = wx.getStorageSync('completedLessons') || {};
    const isCompleted = Boolean(completed[today]);
    const authState = auth.getCachedAuth();

    this.setData({
      today,
      todayLesson: lesson,
      progressText: isCompleted ? '今日已完成' : '今日未完成',
      loginStatusText: auth.getLoginStatusText(authState),
    });

    app.ensureLogin()
      .then((state) => {
        this.setData({ loginStatusText: auth.getLoginStatusText(state) });
      })
      .catch(() => {
        this.setData({ loginStatusText: '登录失败' });
      });
  },

  openLesson() {
    lessonUtils.navigateToLesson(this.data.today);
  },

  openAllCourses() {
    wx.switchTab({ url: '/pages/categories/categories' });
  },
});
