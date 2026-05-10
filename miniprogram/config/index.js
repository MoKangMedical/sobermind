module.exports = {
  // Production example: https://api.your-domain.com
  // The backend must expose POST /api/wechat/login and exchange wx.login code for openid.
  apiBaseUrl: '',
  loginPath: '/api/wechat/login',
  requestTimeout: 10000,
  enableVisitorFallback: true,
  audio: {
    // Production example: https://cdn.your-domain.com/sobermind/audio
    // Files are resolved as `${baseUrl}/lessons/day-001.mp3`.
    baseUrl: '',
    voiceLabel: '自然男声',
  },
  tokenStorageKey: 'sobermind:authToken',
  userStorageKey: 'sobermind:user',
  loginModeStorageKey: 'sobermind:loginMode',
};
