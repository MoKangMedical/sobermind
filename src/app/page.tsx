'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavbarStatic />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-24 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage/10 rounded-full text-sage-dark text-sm mb-8">
            <span>🌅</span>
            每日一课，清醒一生
          </div>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight mb-6 animate-slide-up">
          把人生哲学
          <br />
          <span className="text-sage">变成实际行动</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted max-w-xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          每天十分钟，用古老的智慧和现代的方法，<br />
          清醒、从容、踏实地过好这一生。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/daily"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sage text-white rounded-xl text-lg font-medium hover:bg-sage-dark transition-colors shadow-lg shadow-sage/20"
          >
            开始今日日课
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-ink rounded-xl text-lg font-medium border border-bamboo hover:border-sage transition-colors"
          >
            浏览全部课程
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 max-w-md mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { label: '日课', value: '365', sub: '全年陪伴' },
            { label: '主题', value: '10', sub: '生命维度' },
            { label: '分钟', value: '10', sub: '每日只需' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-sage">{s.value}</div>
              <div className="text-sm text-ink font-medium mt-1">{s.label}</div>
              <div className="text-xs text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-bamboo/30 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-center text-ink mb-12">
            如何<span className="text-sage">清醒</span>地过好这一生？
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: '📖',
                title: '每日一课',
                desc: '365天，每天一个哲学主题。从老子到斯多葛，从王阳明到现代心理学，把人类最深的智慧变成你每天的练习。',
              },
              {
                icon: '✍️',
                title: '深度阅读 + 练习',
                desc: '每课 4000+ 字深度阅读，配 3 道可执行练习和 3 条自我考核标准。读、练、考三位一体。',
              },
              {
                icon: '🧠',
                title: 'AI 辅导（可选）',
                desc: '部署后端后，可接入 DeepSeek API 对每天打卡做智能分析——评分、关键词、深层追问。',
              },
            ].map((f, i) => (
              <div key={i} className="text-center p-6" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-xl font-bold text-ink mb-3">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-center text-ink mb-4">
          十个生命维度
        </h2>
        <p className="text-muted text-center mb-12">从不同角度修炼清醒的人生</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map(c => (
            <Link
              key={c.name}
              href={`/categories/${encodeURIComponent(c.name)}`}
              className="flex flex-col items-center p-4 rounded-xl bg-white border border-bamboo/30 hover:border-sage/40 hover:shadow-sm transition-all group text-center"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{c.icon}</span>
              <span className="font-serif text-sm font-bold text-ink">{c.name}</span>
              <span className="text-xs text-muted">{c.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="bg-warm/50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="font-serif text-xl sm:text-2xl text-ink italic leading-relaxed mb-4">
            「未经审视的人生不值得过。」
          </p>
          <p className="text-muted text-sm">—— 苏格拉底</p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold text-ink mb-4">准备好了吗？</h2>
        <p className="text-muted mb-8">每天十分钟，用365天，修炼一个清醒的自己。</p>
        <Link
          href="/daily"
          className="inline-flex items-center gap-2 px-10 py-4 bg-sage text-white rounded-xl text-lg font-medium hover:bg-sage-dark transition-colors shadow-lg shadow-sage/20"
        >
          🌿 开始阅读
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-bamboo/30 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-muted">
          <p>SoberMind 清醒日课 — 把智慧变成生活</p>
        </div>
      </footer>
    </div>
  );
}

// ---- Shared components ----

const CATEGORIES = [
  { name: '知行合一', icon: '⚡', desc: '行动哲学' },
  { name: '情绪掌控', icon: '🧘', desc: '斯多葛哲学' },
  { name: '深度关系', icon: '🤝', desc: '人际关系' },
  { name: '自我觉察', icon: '🔍', desc: '正念冥想' },
  { name: '极简之道', icon: '🍃', desc: '断舍离' },
  { name: '逆境成长', icon: '🔥', desc: '反脆弱' },
  { name: '心流状态', icon: '💫', desc: '专注力' },
  { name: '复利思维', icon: '📈', desc: '长期主义' },
  { name: '感恩练习', icon: '🙏', desc: '积极心理学' },
  { name: '藏拙守拙', icon: '🎭', desc: '处世智慧' },
];

function NavbarStatic() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="border-b border-bamboo/30 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-ink flex items-center gap-2">
          <span className="text-sage text-xl">🧠</span> 清醒日课
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/daily" className="text-ink/70 hover:text-sage transition-colors">日课</Link>
          <Link href="/categories" className="text-ink/70 hover:text-sage transition-colors">分类</Link>
          <a href="https://github.com/MoKangMedical/sobermind" className="text-ink/40 hover:text-ink transition-colors">GitHub</a>
        </div>
        <button className="sm:hidden text-ink p-1" onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
      {open && (
        <div className="sm:hidden border-t border-bamboo/20 px-4 py-3 flex flex-col gap-3 text-sm">
          <Link href="/daily" onClick={() => setOpen(false)}>日课</Link>
          <Link href="/categories" onClick={() => setOpen(false)}>分类</Link>
        </div>
      )}
    </nav>
  );
}
