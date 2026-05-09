# 🧠 SoberMind 清醒日课

**每日一节课，清醒过一生。**

东方哲学 × 西方心理学 × AI 个性辅导 —— 365 天系统自我成长课程。

---

## ✨ 特性

- **365 天深度课程** — 11 大分类，每课含 4000+ 字深度阅读（开场故事、4 章哲学论述、案例分析、科学拓展、结语）
- **每日练习** — 3 道可执行练习（含操作说明、目的、预估时间）
- **自我考核** — 3 条考核标准 + 反思引导
- **AI 分析** — 对接 DeepSeek API，对打卡回答做智能分析（评分、关键词、反馈、深层追问）
- **连续打卡** — streak 追踪，可视化成长轨迹

---

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 DEEPSEEK_API_KEY

# 3. 启动开发服务器
npm run dev

# 4. 浏览器打开
open http://localhost:3000
```

---

## 📂 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # 注册/登录/登出/用户信息
│   │   ├── checkin/       # 每日打卡
│   │   ├── analyze/       # AI 分析（DeepSeek）
│   │   └── lessons/       # 课程内容
│   ├── daily/             # 每日日课页面
│   ├── dashboard/         # 个人仪表盘
│   ├── history/           # 打卡历史
│   ├── categories/        # 分类浏览
│   └── login|register/    # 登录注册
├── components/
│   ├── AIAnalysis.tsx     # AI 分析卡片
│   ├── Navbar.tsx         # 导航栏
│   └── UI.tsx             # 通用 UI 组件
├── lib/
│   ├── ai-analysis.ts     # DeepSeek API 对接
│   ├── auth.ts            # JWT 认证
│   └── db.ts              # SQLite 数据库
└── data/
    └── lessons.json       # 365 天课程数据
```

---

## 🌐 部署到 Vercel

1. Push 到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入项目
3. 添加环境变量：`DEEPSEEK_API_KEY`、`JWT_SECRET`
4. 部署

> ⚠️ Vercel 免费层 SQLite 文件不持久（/tmp 重启清空）。生产环境建议迁移至 [Turso](https://turso.tech) 或 [Neon](https://neon.tech)。

---

## 🏗️ 技术栈

- **前端**: Next.js 14 (App Router) + React 18 + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (better-sqlite3)
- **AI**: DeepSeek API
- **认证**: JWT + bcryptjs
- **部署**: Vercel

---

## 📖 课程分类

| 分类 | 天数 | 说明 |
|------|------|------|
| 知行合一 | 37 | 王阳明心学实践 |
| 情绪掌控 | 37 | 斯多葛 + 现代心学 |
| 深度关系 | 36 | 真诚连接的智慧 |
| 自我觉察 | 36 | 正念与内在观察 |
| 极简之道 | 36 | 少即是多的生活哲学 |
| 逆境成长 | 36 | 反脆弱与创伤后成长 |
| 心流状态 | 37 | 最优体验的科学 |
| 复利思维 | 37 | 微小积累的巨大力量 |
| 感恩练习 | 36 | 积极心理学实践 |
| 藏拙守拙 | 37 | 东方智慧的反叛 |
| 高级生命观 | 37 | 系统运行的力量 |

---

## 🔒 安全性

- `.env.local` 含真实 API Key，已在 `.gitignore` 中排除
- `.env.example` 是安全模板，可提交到仓库
- JWT 密钥在生产环境务必更换为强随机字符串
