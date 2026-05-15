'use client';

import Link from 'next/link';
import { useState } from 'react';

const frameworkCards = [
  {
    icon: '🧭',
    title: '生命定位',
    source: '东方哲学 × 存在主义',
    desc: '用价值观、死亡觉知和长期主义，先确定你到底要把人生驶向哪里。',
  },
  {
    icon: '🧠',
    title: '心理训练',
    source: '斯多葛 × 正念 × 积极心理学',
    desc: '把情绪、注意力、关系和内在声音变成可以观察、调谐和训练的系统。',
  },
  {
    icon: '⚙️',
    title: '行动系统',
    source: '知行合一 × 复利思维',
    desc: '每课落到最小行动、练习、反思和自我考核，减少只学习不改变。',
  },
  {
    icon: '📊',
    title: '复盘闭环',
    source: '系统复盘 × 会员陪跑',
    desc: '用进度、连续完成、阶段报告和组织版看板，把成长变成可追踪资产。',
  },
];

const phases = [
  { phase: 'Phase 1', icon: '🎭', title: '藏拙守拙', range: 'Day 1-37', level: '基础', minutes: '10分钟', href: '/categories/%E8%97%8F%E6%8B%99%E5%AE%88%E6%8B%99', desc: '先学会收敛锋芒，建立低噪音的人生操作方式。' },
  { phase: 'Phase 2', icon: '⚡', title: '知行合一', range: 'Day 2-362', level: '核心', minutes: '12分钟', href: '/categories/%E7%9F%A5%E8%A1%8C%E5%90%88%E4%B8%80', desc: '把知道变成开始，把开始变成复利。' },
  { phase: 'Phase 3', icon: '🧘', title: '情绪掌控', range: 'Day 3-363', level: '训练', minutes: '10分钟', href: '/categories/%E6%83%85%E7%BB%AA%E6%8E%8C%E6%8E%A7', desc: '用可控/不可控框架拆解焦虑、愤怒和内耗。' },
  { phase: 'Phase 4', icon: '🤝', title: '深度关系', range: 'Day 4-354', level: '关系', minutes: '10分钟', href: '/categories/%E6%B7%B1%E5%BA%A6%E5%85%B3%E7%B3%BB', desc: '从真诚、边界、倾听和脆弱中重建连接。' },
  { phase: 'Phase 5', icon: '🔍', title: '自我觉察', range: 'Day 5-355', level: '内观', minutes: '12分钟', href: '/categories/%E8%87%AA%E6%88%91%E8%A7%89%E5%AF%9F', desc: '训练观察自己，而不是被念头和情绪推着走。' },
  { phase: 'Phase 6', icon: '🍃', title: '极简之道', range: 'Day 6-356', level: '生活', minutes: '10分钟', href: '/categories/%E6%9E%81%E7%AE%80%E4%B9%8B%E9%81%93', desc: '减少占用，把注意力还给真正重要的事。' },
  { phase: 'Phase 7', icon: '🔥', title: '逆境成长', range: 'Day 7-357', level: '韧性', minutes: '12分钟', href: '/categories/%E9%80%86%E5%A2%83%E6%88%90%E9%95%BF', desc: '把压力和失败转化成系统升级的反馈。' },
  { phase: 'Phase 8', icon: '💫', title: '心流与复利', range: 'Day 8-365', level: '策略', minutes: '12分钟', href: '/categories/%E5%BF%83%E6%B5%81%E7%8A%B6%E6%80%81', desc: '用深度工作、长期主义和微习惯积累改变。' },
  { phase: 'Phase 9', icon: '🙏', title: '感恩练习', range: 'Day 10-360', level: '积极', minutes: '8分钟', href: '/categories/%E6%84%9F%E6%81%A9%E7%BB%83%E4%B9%A0', desc: '训练大脑看见已经拥有的支持、资源和爱。' },
  { phase: 'Phase 10', icon: '🌌', title: '高级生命观', range: 'Day 366-402', level: '终极', minutes: '15分钟', href: '/categories/%E9%AB%98%E7%BA%A7%E7%94%9F%E5%91%BD%E8%A7%82', desc: '把系统动力、意义构建、死亡觉知和复盘整合成生命操作系统。' },
];

const tools = [
  { icon: '🕐', title: '今日闭环', href: '/daily', desc: '进入今天课程，完成导读、阅读、练习、反思和打卡。' },
  { icon: '🗺️', title: '课程阶段', href: '/categories', desc: '按 11 个生命维度浏览 402 节课程。' },
  { icon: '🎧', title: '男声导读', href: '/daily/1', desc: '每节课配自然男声导读，适合通勤和睡前学习。' },
  { icon: '💼', title: '会员路径', href: '/pricing', desc: '从免费体验进入阶段复盘、陪跑和组织版能力。' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <NavbarStatic />

      <section className="relative overflow-hidden px-4 sm:px-6 pt-28 pb-32 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(226,182,79,0.20),transparent_32%),linear-gradient(180deg,#09090b_0%,#0f0f13_78%,#15151a_100%)]" />
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage/10 px-4 py-2 text-sm text-sage mb-8">
            402 节清醒日课已上线 · Web + 小程序 + 自然男声
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-normal mb-6">
            建立你的生命操作系统
            <br />
            <span className="text-sage">把清醒变成日常节奏</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-10">
            以东方哲学、西方心理学和行动复盘为底层框架，
            用 402 节阶段课程，把听、读、练、写、打卡连接成长期成长闭环。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/daily" className="inline-flex items-center justify-center rounded-xl bg-sage px-8 py-4 text-lg font-semibold text-zinc-950 hover:bg-sage-dark">
              开始学习 →
            </Link>
            <Link href="#courses" className="inline-flex items-center justify-center rounded-xl border border-bamboo bg-parchment px-8 py-4 text-lg font-semibold text-ink hover:border-sage/60">
              查看课程体系
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
            {[
              ['402节', '系统日课'],
              ['11维', '生命框架'],
              ['5步', '学习闭环'],
            ].map(([value, label]) => (
              <div key={value} className="text-center">
                <div className="font-serif text-4xl sm:text-5xl font-black text-sage">{value}</div>
                <div className="mt-2 text-sm text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-parchment border-y border-bamboo py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-serif text-2xl sm:text-3xl leading-relaxed text-ink">
            “真正的清醒，不是知道更多道理，而是每天把一个道理落到生活里。”
          </p>
          <p className="text-muted mt-5">SoberMind 清醒日课</p>
        </div>
      </section>

      <section id="framework" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sage text-sm font-semibold mb-3">知识框架</p>
          <h2 className="font-serif text-3xl sm:text-5xl font-black mb-5">四维清醒框架，一个完整体系</h2>
          <p className="text-muted leading-relaxed">
            借鉴学院型站点的信息架构，我们把清醒日课重组为从定位、训练、行动到复盘的四维体系。
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {frameworkCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-bamboo bg-parchment p-6 hover:border-sage/50 transition-colors">
              <div className="text-4xl mb-5">{card.icon}</div>
              <h3 className="font-serif text-xl font-bold text-ink">{card.title}</h3>
              <p className="text-sage text-sm mt-2">{card.source}</p>
              <p className="text-muted text-sm leading-relaxed mt-4">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="bg-[#0f0f13] border-y border-bamboo py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sage text-sm font-semibold mb-3">课程体系</p>
            <h2 className="font-serif text-3xl sm:text-5xl font-black mb-5">10 个阶段，402 节课完成生命训练</h2>
            <p className="text-muted leading-relaxed">
              每课包含主题导读、正文讲解、交互练习、自我考核、反思记录和自然男声讲解。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {phases.map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-2xl border border-bamboo bg-parchment p-5 hover:border-sage/60 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-2xl">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="text-sage font-semibold">{item.phase}</span>
                      <span>{item.range}</span>
                      <span className="rounded-full bg-sage/10 px-2 py-1 text-sage">{item.level}</span>
                      <span>{item.minutes}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-ink mt-3 group-hover:text-sage">{item.title}</h3>
                    <p className="text-muted text-sm leading-relaxed mt-2">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sage text-sm font-semibold mb-3">互动工具</p>
          <h2 className="font-serif text-3xl sm:text-5xl font-black mb-5">不止阅读，动手完成改变</h2>
          <p className="text-muted leading-relaxed">把课程、音频、进度和会员转化放在同一条路径里。</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link key={tool.title} href={tool.href} className="rounded-2xl border border-bamboo bg-parchment p-6 text-center hover:border-sage/60 transition-colors">
              <div className="text-5xl mb-5">{tool.icon}</div>
              <h3 className="font-serif text-xl font-bold">{tool.title}</h3>
              <p className="text-muted text-sm leading-relaxed mt-3">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-parchment border-y border-bamboo py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sage text-sm font-semibold mb-3">定价方案</p>
          <h2 className="font-serif text-3xl sm:text-5xl font-black mb-5">从免费体验到会员陪跑</h2>
          <p className="text-muted leading-relaxed mb-8">
            先用免费课程建立信任，再通过会员复盘、音频合集、组织版小程序和后台能力完成商业化。
          </p>
          <Link href="/pricing" className="inline-flex items-center justify-center rounded-xl bg-sage px-8 py-4 text-lg font-semibold text-zinc-950 hover:bg-sage-dark">
            查看会员方案 →
          </Link>
        </div>
      </section>

      <FooterStatic />
    </div>
  );
}

function NavbarStatic() {
  const [open, setOpen] = useState(false);
  const links = [
    ['知识框架', '#framework'],
    ['课程体系', '#courses'],
    ['互动工具', '#tools'],
    ['会员方案', '/pricing'],
    ['开始学习', '/daily'],
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-bamboo bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage text-zinc-950">清</span>
          清醒研究院
        </Link>
        <div className="hidden items-center gap-7 text-sm md:flex">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className={label === '开始学习' ? 'rounded-lg bg-sage px-4 py-2 font-semibold text-zinc-950' : 'text-muted hover:text-sage'}>
              {label}
            </Link>
          ))}
        </div>
        <button className="md:hidden text-ink" onClick={() => setOpen(!open)}>
          {open ? '关闭' : '菜单'}
        </button>
      </div>
      {open && (
        <div className="border-t border-bamboo px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            {links.map(([label, href]) => (
              <Link key={label} href={href} onClick={() => setOpen(false)} className="text-muted">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function FooterStatic() {
  return (
    <footer className="border-t border-bamboo py-12">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted">
        <div className="mb-5 flex flex-wrap justify-center gap-6">
          <Link href="/categories" className="hover:text-sage">课程分类</Link>
          <Link href="/daily" className="hover:text-sage">今日日课</Link>
          <Link href="/pricing" className="hover:text-sage">会员方案</Link>
          <a href="https://github.com/MoKangMedical/sobermind" className="hover:text-sage">GitHub</a>
        </div>
        <p>SoberMind 清醒研究院 © 2026 · 把智慧变成生活系统</p>
      </div>
    </footer>
  );
}
