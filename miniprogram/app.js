const auth = require('./utils/auth');

App({
  globalData: {
    appName: '清醒日课',
    authReady: null,
    authState: null,
  },

  onLaunch() {
    this.globalData.authReady = this.ensureLogin();
  },

  async ensureLogin(options = {}) {
    const authState = await auth.ensureLogin(options);
    this.globalData.authState = authState;
    return authState;
  },
});
