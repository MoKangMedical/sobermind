const config = require('../config/index');

function promisifyWx(method, options = {}) {
  return new Promise((resolve, reject) => {
    wx[method]({
      ...options,
      success: resolve,
      fail: reject,
    });
  });
}

function getCachedAuth() {
  const token = wx.getStorageSync(config.tokenStorageKey);
  const user = wx.getStorageSync(config.userStorageKey);
  const mode = wx.getStorageSync(config.loginModeStorageKey);

  if (!token || !user) {
    return null;
  }

  return { token, user, mode: mode || 'wechat' };
}

function saveAuth(authState) {
  wx.setStorageSync(config.tokenStorageKey, authState.token);
  wx.setStorageSync(config.userStorageKey, authState.user);
  wx.setStorageSync(config.loginModeStorageKey, authState.mode);
  return authState;
}

function clearAuth() {
  wx.removeStorageSync(config.tokenStorageKey);
  wx.removeStorageSync(config.userStorageKey);
  wx.removeStorageSync(config.loginModeStorageKey);
}

function checkSession() {
  return new Promise((resolve) => {
    wx.checkSession({
      success: () => resolve(true),
      fail: () => resolve(false),
    });
  });
}

async function getWxLoginCode() {
  const result = await promisifyWx('login');
  if (!result.code) {
    throw new Error('wx.login 未返回 code');
  }
  return result.code;
}

function normalizeLoginResponse(response) {
  const payload = response && response.data && response.data.data ? response.data.data : response.data;
  if (!payload || !payload.token) {
    throw new Error('登录接口未返回 token');
  }

  return {
    token: payload.token,
    user: payload.user || { openid: payload.openid || '' },
    mode: 'wechat',
  };
}

function requestWechatSession(code) {
  const url = `${config.apiBaseUrl}${config.loginPath}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'POST',
      timeout: config.requestTimeout,
      header: {
        'content-type': 'application/json',
      },
      data: { code },
      success(response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`登录接口异常：${response.statusCode}`));
          return;
        }

        try {
          resolve(normalizeLoginResponse(response));
        } catch (error) {
          reject(error);
        }
      },
      fail: reject,
    });
  });
}

function createVisitorAuth() {
  let visitorId = wx.getStorageSync('sobermind:visitorId');
  if (!visitorId) {
    visitorId = `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    wx.setStorageSync('sobermind:visitorId', visitorId);
  }

  return {
    token: `visitor-token-${visitorId}`,
    mode: 'visitor',
    user: {
      openid: visitorId,
      nickname: '本机用户',
    },
  };
}

async function login() {
  if (!config.apiBaseUrl) {
    if (config.enableVisitorFallback) {
      return saveAuth(createVisitorAuth());
    }
    throw new Error('尚未配置小程序登录后端 apiBaseUrl');
  }

  const code = await getWxLoginCode();
  const authState = await requestWechatSession(code);
  return saveAuth(authState);
}

async function ensureLogin(options = {}) {
  const cached = getCachedAuth();
  if (cached && !options.force) {
    if (cached.mode === 'visitor') {
      return cached;
    }

    const sessionValid = await checkSession();
    if (sessionValid) {
      return cached;
    }
  }

  return login();
}

function getLoginStatusText(authState) {
  if (!authState) {
    return '登录中';
  }
  return authState.mode === 'visitor' ? '开发游客态' : '微信已登录';
}

module.exports = {
  clearAuth,
  ensureLogin,
  getCachedAuth,
  getLoginStatusText,
  login,
};
