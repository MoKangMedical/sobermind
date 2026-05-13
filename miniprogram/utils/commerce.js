const config = require('../config/index');
const request = require('./request');

function getProducts() {
  return (config.commerce && config.commerce.products) || [];
}

function getMembership() {
  const key = config.commerce.membershipStorageKey;
  return wx.getStorageSync(key) || {
    plan: 'free',
    name: '免费体验',
    status: 'active',
  };
}

function saveMembership(membership) {
  wx.setStorageSync(config.commerce.membershipStorageKey, {
    ...membership,
    updatedAt: Date.now(),
  });
}

function saveIntent(product) {
  wx.setStorageSync(config.commerce.intentStorageKey, {
    productId: product.id,
    productName: product.name,
    createdAt: Date.now(),
  });
}

function startCheckout(productId) {
  const product = getProducts().find((item) => item.id === productId);
  if (!product) {
    return Promise.reject(new Error('会员方案不存在'));
  }

  saveIntent(product);

  if (!config.apiBaseUrl || !config.commerce.paymentEnabled) {
    return Promise.resolve({
      mode: 'lead',
      message: '已记录开通意向。配置微信支付后可直接拉起支付。',
      product,
    });
  }

  return request.request({
    path: config.commerce.checkoutPath,
    method: 'POST',
    data: { productId },
  }).then((order) => {
    if (order && order.mode === 'lead') {
      return {
        mode: 'lead',
        message: order.message || '已记录开通意向。',
        product: order.product || product,
      };
    }

    if (!order || !order.paymentParams) {
      return {
        mode: 'lead',
        message: '后端尚未返回支付参数',
        product,
      };
    }

    return new Promise((resolve, reject) => {
      wx.requestPayment({
        ...order.paymentParams,
        success() {
          saveMembership({
            plan: product.id,
            name: product.name,
            status: 'active',
            orderId: order.orderId,
          });
          resolve({ mode: 'paid', product, orderId: order.orderId });
        },
        fail: reject,
      });
    });
  });
}

module.exports = {
  getProducts,
  getMembership,
  saveMembership,
  saveIntent,
  startCheckout,
};
