// Static UI components - shared across pages

import Link from 'next/link';
import React from 'react';

export const CATEGORIES = [
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
  { name: '高级生命观', icon: '🌌', desc: '系统运行' },
];

export function Navbar() {
  return (
    <nav className="border-b border-bamboo bg-cream/85 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-ink flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage text-zinc-950">清</span> 清醒研究院
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/daily" className="text-muted hover:text-sage transition-colors">日课</Link>
          <Link href="/categories" className="text-muted hover:text-sage transition-colors">分类</Link>
          <Link href="/pricing" className="text-muted hover:text-sage transition-colors">会员</Link>
          <a href="https://github.com/MoKangMedical/sobermind" className="text-muted hover:text-sage transition-colors">GitHub</a>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-bamboo py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted">
        <p>SoberMind 清醒研究院 — 把智慧变成生活系统</p>
      </div>
    </footer>
  );
}

import fs from 'fs';
import path from 'path';

export interface Lesson {
  day_number: number;
  title: string;
  category: string;
  content: string;
  action_points: string[];
  question: string;
  quote: string;
  quote_author: string;
  reading: string;
  body: string;
  closing: string;
  exercises: { instruction: string; purpose: string; time_estimate: string }[];
  self_assessment: { criteria: string[]; reflection_prompt: string };
  audio?: {
    status?: string;
    voice?: string;
    voiceLabel?: string;
    fileName?: string;
    path?: string;
    url?: string;
  };
}

let _lessonsCache: Lesson[] | null = null;

export function loadAllLessons(): Lesson[] {
  if (_lessonsCache) return _lessonsCache;
  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  // Load main lessons and advanced life-view lessons.
  const mainPath = path.join(dataDir, 'lessons.json');
  const mainLessons: Lesson[] = JSON.parse(fs.readFileSync(mainPath, 'utf8'));

  // Load 高级生命观 v2 lessons (37 days) and renumber after main
  const sgPath = path.join(dataDir, 'lessons_v2_shengguan.json');
  let sgLessons: Lesson[] = [];
  if (fs.existsSync(sgPath)) {
    sgLessons = JSON.parse(fs.readFileSync(sgPath, 'utf8'));
    const baseDay = mainLessons.length;
    sgLessons = sgLessons.map((l, i) => ({ ...l, day_number: baseDay + i + 1 }));
  }

  _lessonsCache = [...mainLessons, ...sgLessons];
  return _lessonsCache;
}

export function getTodayDayNumber(): number {
  const start = new Date('2026-01-01');
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = loadAllLessons().length;
  return ((diffDays % totalDays) + totalDays) % totalDays + 1;
}
