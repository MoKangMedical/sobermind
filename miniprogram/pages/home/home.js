const lessonUtils = require('../../utils/lesson-utils');
const auth = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    today: 1,
    totalDays: 0,
    todayLesson: null,
    categories: [],
    completedCount: 0,
    loginStatusText: '登录中',
    userLabel: '正在建立登录态',
  },

  onShow() {
    const today = lessonUtils.getTodayDayNumber();
    const completed = wx.getStorageSync('completedLessons') || {};
    const authState = auth.getCachedAuth();

    this.setData({
      today,
      totalDays: lessonUtils.getTotalDays(),
      todayLesson: lessonUtils.findLessonSummary(today),
      categories: lessonUtils.categories,
      completedCount: Object.keys(completed).length,
      loginStatusText: auth.getLoginStatusText(authState),
      userLabel: authState ? this.getUserLabel(authState) : '正在建立登录态',
    });

    app.ensureLogin()
      .then((state) => {
        this.setData({
          loginStatusText: auth.getLoginStatusText(state),
          userLabel: this.getUserLabel(state),
        });
      })
      .catch((error) => {
        this.setData({
          loginStatusText: '登录失败',
          userLabel: error.message || '请检查登录配置',
        });
      });
  },

  getUserLabel(authState) {
    if (!authState || !authState.user) {
      return '未登录';
    }
    if (authState.mode === 'visitor') {
      return '本机进度已启用';
    }
    return authState.user.nickname || `OpenID ${String(authState.user.openid || '').slice(0, 8)}...`;
  },

  refreshLogin() {
    wx.showLoading({ title: '登录中' });
    app.ensureLogin({ force: true })
      .then((state) => {
        wx.hideLoading();
        this.setData({
          loginStatusText: auth.getLoginStatusText(state),
          userLabel: this.getUserLabel(state),
        });
        wx.showToast({ title: '登录成功', icon: 'success' });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({ title: error.message || '登录失败', icon: 'none' });
      });
  },

  openTodayLesson() {
    lessonUtils.navigateToLesson(this.data.today);
  },

  openCategories() {
    wx.switchTab({ url: '/pages/categories/categories' });
  },

  openCategory(event) {
    const { name } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/category/category?name=${encodeURIComponent(name)}`,
    });
  },
});
