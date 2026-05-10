# 清醒日课微信小程序

这是从现有 Next.js 课程数据生成的原生微信小程序版本，可直接用微信开发者工具导入 `miniprogram/` 目录。

## 已实现

- 首页：今日课程、课程总数、分类入口、已完成数
- 今日日课：按 2026-01-01 起始日期自动计算今日课程
- 分类浏览：11 个生命维度、402 节课程摘要
- 课程详情：长文阅读、今日练习、自我考核、反思记录、完成状态
- 自动登录：启动时建立微信登录态；未配置后端时使用开发游客态
- 男声导读：课程页预留自然男声音频播放器，支持播放、暂停、进度拖动和倍速
- 本地存储：反思、自我考核、完成记录会保存到微信本地缓存
- 分包：课程正文按区间拆到 5 个分包，主包只保留摘要和页面壳

## 微信自动登录

小程序启动时会调用 `miniprogram/utils/auth.js` 的 `ensureLogin()`：

1. 如果本地已有有效登录态，直接复用。
2. 如果没有登录态或微信 session 失效，调用 `wx.login()` 获取临时 code。
3. 将 code POST 到后端 `POST /api/wechat/login`。
4. 后端用 AppID 和 AppSecret 调微信 `code2Session`，拿到 openid 后签发业务 token。
5. 小程序缓存 token 和用户信息，后续请求自动带 `Authorization: Bearer <token>`。

配置文件在 `miniprogram/config/index.js`：

```js
module.exports = {
  apiBaseUrl: 'https://api.your-domain.com',
  loginPath: '/api/wechat/login',
};
```

开发阶段 `apiBaseUrl` 为空时会启用“开发游客态”，页面和本地进度仍可正常调试。正式上线前必须配置 HTTPS 后端域名，并在微信公众平台把该域名加入 request 合法域名。

后端接口返回格式：

```json
{
  "token": "your-business-token",
  "user": {
    "openid": "wechat-openid",
    "unionid": ""
  }
}
```

项目提供了一个 Node 示例后端：

```bash
WECHAT_MINIPROGRAM_APPID=你的AppID \
WECHAT_MINIPROGRAM_SECRET=你的AppSecret \
JWT_SECRET=强随机字符串 \
npm run wechat:login-server
```

示例文件：`server/wechat-login.example.js`。注意：AppSecret 只能放在后端，不能写入小程序客户端。

## 重新生成课程数据

当 `src/data/lessons.json` 或 `src/data/lessons_v2_shengguan.json` 更新后，在项目根目录执行：

```bash
npm run build:miniprogram
```

脚本会更新：

- `miniprogram/data/summary.js`
- `miniprogram/packages/lessons*/data/lessons.js`

当前分包覆盖 Day 1-425。课程数超过 425 时，需要同步扩展 `scripts/build_miniprogram_data.js` 里的 `lessonPackages` 和 `miniprogram/app.json` 的 `subpackages`。

## 课程音频

课程数据会为每一天生成音频元数据，默认文件路径为：

```text
lessons/day-001.mp3
lessons/day-002.mp3
...
```

生成旁白脚本：

```bash
npm run audio:scripts
```

生成自然男声 MP3 前，先在环境变量中提供 TTS Key。默认使用 OpenAI TTS，男声 voice 为 `onyx`，也可以通过 `OPENAI_TTS_VOICE` 覆盖：

```bash
OPENAI_API_KEY=你的Key npm run audio:generate -- --write --from=1 --to=402
```

生成后的 MP3 默认在 `audio/output/lessons/`。正式上线建议上传到 HTTPS CDN 或对象存储，然后配置：

```js
// miniprogram/config/index.js
module.exports = {
  audio: {
    baseUrl: 'https://cdn.your-domain.com/sobermind/audio',
    voiceLabel: '自然男声',
  },
};
```

也可以在重新生成小程序数据时直接写入完整音频 URL：

```bash
MINIPROGRAM_AUDIO_BASE_URL=https://cdn.your-domain.com/sobermind/audio npm run build:miniprogram
```

上线前需要在微信公众平台把音频 CDN 域名加入 downloadFile 合法域名。

## 本地预览

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择：`/Users/apple/Desktop/sobermind/miniprogram`。
4. 没有正式 AppID 时可先使用测试号；准备上传时，把 `project.config.json` 里的 `appid` 从 `touristappid` 改成你的小程序 AppID。
5. 在开发者工具中编译、预览、真机调试。

## 上线前检查

- 在微信公众平台完成小程序注册、名称、头像、简介、服务类目等基础信息。
- 使用微信开发者工具上传代码。
- 到微信公众平台版本管理中提交审核。
- 审核通过后发布正式版。

参考官方入口：

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)
- [小程序分包](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html)
