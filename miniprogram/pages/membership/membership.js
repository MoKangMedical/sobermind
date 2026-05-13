const commerce = require('../../utils/commerce');

Page({
  data: {
    products: [],
    membership: null,
  },

  onShow() {
    this.setData({
      products: commerce.getProducts(),
      membership: commerce.getMembership(),
    });
  },

  startCheckout(event) {
    const { id } = event.currentTarget.dataset;
    wx.showLoading({ title: '处理中' });
    commerce.startCheckout(id)
      .then((result) => {
        wx.hideLoading();
        if (result.mode === 'paid') {
          wx.showToast({ title: '开通成功', icon: 'success' });
          this.setData({ membership: commerce.getMembership() });
          return;
        }
        wx.showModal({
          title: '已记录意向',
          content: result.message || '配置微信支付后可直接开通会员。',
          showCancel: false,
        });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({ title: error.message || '暂时无法开通', icon: 'none' });
      });
  },
});
