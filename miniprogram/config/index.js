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
    voiceLabel: 'YunyangNeural 男声',
  },
  commerce: {
    paymentEnabled: false,
    leadPath: '/api/membership/lead',
    checkoutPath: '/api/membership/checkout',
    membershipStorageKey: 'sobermind:membership',
    intentStorageKey: 'sobermind:memberIntent',
    products: [
      {
        id: 'annual',
        name: '清醒年度会员',
        price: '199',
        period: '年',
        desc: '阶段复盘、音频合集、会员模板与月度陪跑',
      },
      {
        id: 'lifetime',
        name: '终身会员',
        price: '699',
        period: '一次性',
        desc: '终身访问课程升级、音频资产与高级生命观内容',
      },
      {
        id: 'organization',
        name: '组织版',
        price: '定制',
        period: '团队',
        desc: '团队进度看板、私有课程和品牌化部署',
      },
    ],
  },
  tokenStorageKey: 'sobermind:authToken',
  userStorageKey: 'sobermind:user',
  loginModeStorageKey: 'sobermind:loginMode',
};
