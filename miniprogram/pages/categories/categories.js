const lessonUtils = require('../../utils/lesson-utils');

Page({
  data: {
    totalDays: 0,
    categories: [],
  },

  onShow() {
    this.setData({
      totalDays: lessonUtils.getTotalDays(),
      categories: lessonUtils.categories,
    });
  },

  openCategory(event) {
    const { name } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/category/category?name=${encodeURIComponent(name)}`,
    });
  },
});
