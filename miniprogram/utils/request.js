const config = require('../config/index');
const auth = require('./auth');

function request(options) {
  const { path, url, method = 'GET', data, header = {}, authRequired = true } = options;

  return new Promise(async (resolve, reject) => {
    try {
      const authState = authRequired ? await auth.ensureLogin() : null;
      wx.request({
        url: url || `${config.apiBaseUrl}${path}`,
        method,
        data,
        timeout: config.requestTimeout,
        header: {
          'content-type': 'application/json',
          ...(authState ? { Authorization: `Bearer ${authState.token}` } : {}),
          ...header,
        },
        success(response) {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(response.data);
            return;
          }
          reject(new Error(`请求失败：${response.statusCode}`));
        },
        fail: reject,
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  request,
};
