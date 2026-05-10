const lessonUtils = require('../../utils/lesson-utils');

Page({
  data: {
    category: null,
    lessons: [],
  },

  onLoad(options) {
    const categoryName = decodeURIComponent(options.name || '');
    const category = lessonUtils.findCategory(categoryName);
    const lessons = lessonUtils.getLessonsByCategory(categoryName);

    wx.setNavigationBarTitle({
      title: categoryName || '课程列表',
    });

    this.setData({
      category,
      lessons,
    });
  },

  openLesson(event) {
    const { day } = event.currentTarget.dataset;
    lessonUtils.navigateToLesson(day);
  },
});
