'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type LessonState = {
  checkedCriteria: string[];
  reflection: string;
  completedAt?: number;
};

type Props = {
  dayNumber: number;
  title: string;
  category: string;
  criteria: string[];
  question: string;
  totalDays: number;
};

const completedKey = 'sobermind:completedLessons';

function lessonKey(day: number) {
  return `sobermind:lesson:${day}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getDayKey(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentStreak(completed: Record<string, number>) {
  const activeDays = new Set(Object.values(completed).map(getDayKey));
  const cursor = new Date();
  let streak = 0;

  for (;;) {
    const key = getDayKey(cursor.getTime());
    if (!activeDays.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function LearningLoopPanel({ dayNumber, title, category, criteria, question, totalDays }: Props) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<LessonState>({ checkedCriteria: [], reflection: '' });
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setState(readJson<LessonState>(lessonKey(dayNumber), { checkedCriteria: [], reflection: '' }));
    setCompleted(readJson<Record<string, number>>(completedKey, {}));
    setMounted(true);
  }, [dayNumber]);

  const completedCount = Object.keys(completed).length;
  const progress = totalDays ? Math.min(100, Math.round((completedCount / totalDays) * 100)) : 0;
  const streak = useMemo(() => getCurrentStreak(completed), [completed]);
  const isCompleted = Boolean(completed[String(dayNumber)]);
  const criteriaDone = criteria.length ? state.checkedCriteria.length === criteria.length : true;
  const reflectionDone = state.reflection.trim().length >= 8;
  const canComplete = criteriaDone && reflectionDone;

  function showSavedMessage(message: string, timeout = 2200) {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(''), timeout);
  }

  function updateState(nextState: LessonState, showSaved = false) {
    setState(nextState);
    writeJson(lessonKey(dayNumber), nextState);
    if (showSaved) {
      showSavedMessage('已保存到本机学习档案');
    }
  }

  function toggleCriterion(index: number) {
    const value = String(index);
    const checkedCriteria = state.checkedCriteria.includes(value)
      ? state.checkedCriteria.filter((item) => item !== value)
      : [...state.checkedCriteria, value];
    updateState({ ...state, checkedCriteria });
  }

  function completeLesson() {
    const nextCompleted = { ...completed, [String(dayNumber)]: Date.now() };
    const nextState = { ...state, completedAt: nextCompleted[String(dayNumber)] };
    setCompleted(nextCompleted);
    writeJson(completedKey, nextCompleted);
    updateState(nextState, true);
  }

  function saveMemberIntent() {
    writeJson('sobermind:memberIntent', {
      source: 'lesson',
      dayNumber,
      title,
      category,
      createdAt: Date.now(),
    });
    showSavedMessage('已记录会员意向，可用于后续接入支付/CRM', 2600);
  }

  return (
    <section className="mb-10">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">今日闭环</h2>
        <p className="text-muted text-sm">听导读、读正文、做练习、写反思、完成打卡，形成可持续的学习反馈。</p>
      </div>

      <div className="bg-parchment rounded-2xl p-5 sm:p-6 border border-bamboo mb-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-sm text-muted">本机学习进度</p>
            <p className="font-serif text-2xl font-bold text-ink mt-1">{completedCount} / {totalDays}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">连续完成</p>
            <p className="font-serif text-2xl font-bold text-sage mt-1">{streak} 天</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-bamboo/30 overflow-hidden">
          <div className="h-full bg-sage progress-fill" style={{ width: mounted ? `${progress}%` : '0%' }} />
        </div>
      </div>

      <div className="grid gap-4 mb-5">
        {criteria.map((item, index) => (
          <label key={item} className="flex items-start gap-3 bg-parchment rounded-xl p-4 border border-bamboo">
            <input
              type="checkbox"
              checked={state.checkedCriteria.includes(String(index))}
              onChange={() => toggleCriterion(index)}
              className="mt-1 accent-sage"
            />
            <span className="text-ink/80 leading-relaxed">{item}</span>
          </label>
        ))}
      </div>

      <div className="bg-parchment rounded-xl p-5 border border-bamboo mb-5">
        <p className="text-sage-dark font-medium mb-2">今日反思</p>
        <p className="text-ink font-medium mb-4">{question}</p>
        <textarea
          className="w-full h-32 p-4 border border-bamboo rounded-lg bg-cream text-ink/80 resize-y focus:outline-none focus:border-sage/50 focus:ring-1 focus:ring-sage/20"
          placeholder="写下你的思考，至少 8 个字后可完成今日闭环。"
          value={state.reflection}
          onChange={(event) => updateState({ ...state, reflection: event.target.value })}
          onBlur={() => showSavedMessage('已保存到本机学习档案')}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={completeLesson}
          disabled={!canComplete || isCompleted}
          className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-sage text-zinc-950 font-medium disabled:bg-bamboo disabled:text-muted transition-colors"
        >
          {isCompleted ? '今日已完成' : canComplete ? '完成今日闭环' : '完成考核与反思后打卡'}
        </button>
        <Link
          href={`/daily/${dayNumber >= totalDays ? 1 : dayNumber + 1}`}
          className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl border border-bamboo bg-parchment text-ink font-medium hover:border-sage transition-colors"
        >
          继续下一课
        </Link>
      </div>

      <div className="mt-5 bg-sage/5 rounded-2xl p-5 border border-sage/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-serif text-lg font-bold text-ink">清醒会员</p>
            <p className="text-sm text-muted mt-1">解锁系统复盘、音频合集、阶段报告、社群陪跑和组织版能力。</p>
          </div>
          <div className="flex gap-3">
            <Link href="/pricing" className="px-4 py-2 rounded-lg bg-parchment border border-bamboo text-sm font-medium text-ink">
              查看方案
            </Link>
            <button type="button" onClick={saveMemberIntent} className="px-4 py-2 rounded-lg bg-sage text-zinc-950 text-sm font-medium">
              记录意向
            </button>
          </div>
        </div>
      </div>

      {savedMessage && (
        <p className="mt-3 text-sm text-sage-dark">{savedMessage}</p>
      )}
    </section>
  );
}
