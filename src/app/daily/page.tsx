'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { Card, Badge, LoadingSpinner, EmptyState } from '@/components/UI';
import AIAnalysisCard from '@/components/AIAnalysis';

interface Lesson {
  id: number;
  day_number: number;
  title: string;
  category: string;
  content: string;
  action_points: string[];
  question: string;
  quote: string;
  quote_author: string;
  checked?: boolean;
  my_answer?: string;
  checked_at?: string;
  // Rich content fields
  reading?: string;
  body?: string;
  closing?: string;
  exercises?: { instruction: string; purpose: string; time_estimate: string }[];
  self_assessment?: { criteria: string[]; reflection_prompt: string };
}

interface Stats {
  streak: number;
  total: number;
  longest: number;
}

function DailyPageInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryDay = searchParams.get('day');
  const isHistoryView = !!queryDay;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [answer, setAnswer] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<Stats>({ streak: 0, total: 0, longest: 0 });
  const [showReading, setShowReading] = useState(false);
  const [exerciseChecked, setExerciseChecked] = useState<Record<number, boolean>>({});
  const [assessmentDone, setAssessmentDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchToday() {
      setPageLoading(true);
      setError('');
      try {
        let dayNumber: number;
        if (queryDay) {
          dayNumber = parseInt(queryDay);
        } else {
          const start = new Date('2025-01-01').getTime();
          const now = Date.now();
          const dayDiff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
          dayNumber = (dayDiff % 365) + 1;
        }

        const res = await fetch(`/api/lessons?day=${dayNumber}`);
        if (!res.ok) throw new Error('Failed to load lesson');
        const data = await res.json();

        if (data.lessons && data.lessons.length > 0) {
          const l = data.lessons[0];
          setLesson(l);
          if (l.checked) {
            setAnswer(l.my_answer || '');
          } else {
            setAnswer('');
          }
        } else {
          setError('该日课不存在');
        }
      } catch {
        setError('加载日课失败');
      } finally {
        setPageLoading(false);
      }
    }
    fetchToday();
  }, [user, queryDay]);

  const handleCheckin = async () => {
    if (!lesson) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_number: lesson.day_number,
          lesson_id: lesson.id,
          answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.status === 'already_checked') {
          setError('今日已打卡');
        } else {
          setError(data.error || '打卡失败');
        }
      } else {
        setSuccess('🎉 打卡成功！清醒值 +1');
        setLesson({ ...lesson, checked: true });
        setStats(data.stats);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('打卡失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || pageLoading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-parchment/30">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-sage/10 text-sage-dark text-sm px-4 py-3 rounded-xl mb-6 animate-fade-in flex items-center gap-2">
            {success}
          </div>
        )}

        {isHistoryView && (
          <button
            onClick={() => router.push('/daily')}
            className="text-sm text-sage hover:text-sage-dark transition-colors mb-4 inline-block"
          >
            ← 回到今日日课
          </button>
        )}

        {!lesson ? (
          <EmptyState
            icon="📖"
            title="日课加载中"
            description="请稍等..."
          />
        ) : (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Badge>{lesson.category}</Badge>
                <span className="text-sm text-muted">第 {lesson.day_number} 天</span>
                {lesson.checked && (
                  <Badge color="sage">✓ 已打卡</Badge>
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-tight">
                {lesson.title}
              </h1>
            </div>

            {/* Quote */}
            <Card className="mb-6 bg-warm/30 border-clay-light/30">
              <p className="font-serif text-lg text-ink italic leading-relaxed mb-2">
                「{lesson.quote}」
              </p>
              <p className="text-sm text-muted">—— {lesson.quote_author}</p>
            </Card>

            {/* Core Lesson Content */}
            <Card className="mb-6">
              <h2 className="font-serif text-lg font-bold text-ink mb-4">📖 今日智慧</h2>
              <div className="text-ink leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {lesson.content}
              </div>
            </Card>

            {/* Reading — Expandable */}
            {lesson.reading && (
              <Card className="mb-6">
                <button
                  onClick={() => setShowReading(!showReading)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <h2 className="font-serif text-lg font-bold text-ink">📚 深度阅读</h2>
                  <span className="text-sm text-muted">
                    {showReading ? '收起 ▲' : (lesson.body ? '展开阅读 ▼' : '')}
                  </span>
                </button>

                {/* Opening */}
                <div className="mt-4 text-ink leading-relaxed text-sm sm:text-base border-l-4 border-sage/30 pl-4 italic bg-warm/30 rounded-r-xl p-3">
                  {lesson.reading}
                </div>

                {/* Full Body */}
                {showReading && lesson.body && (
                  <div className="mt-4 animate-fade-in">
                    <div className="text-ink leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {lesson.body}
                    </div>

                    {/* Closing */}
                    {lesson.closing && (
                      <div className="mt-6 bg-sage/5 rounded-xl p-4 border border-sage/20">
                        <h3 className="font-serif text-base font-bold text-sage-dark mb-2">🪷 今日结语</h3>
                        <p className="text-sm text-ink leading-relaxed">{lesson.closing}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Exercises */}
            {lesson.exercises && lesson.exercises.length > 0 && (
              <Card className="mb-6">
                <h2 className="font-serif text-lg font-bold text-ink mb-4">🏋️ 今日练习</h2>
                <div className="space-y-4">
                  {lesson.exercises.map((ex, i) => (
                    <div key={i} className="bg-warm/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => setExerciseChecked(prev => ({ ...prev, [i]: !prev[i] }))}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            exerciseChecked[i]
                              ? 'bg-sage border-sage text-white'
                              : 'border-bamboo hover:border-sage'
                          }`}
                        >
                          {exerciseChecked[i] && '✓'}
                        </button>
                        <div className="flex-1">
                          <p className="text-sm text-ink font-medium leading-relaxed">{ex.instruction}</p>
                          <div className="flex gap-3 mt-1.5">
                            <span className="text-xs text-muted">🎯 {ex.purpose}</span>
                            <span className="text-xs text-muted">⏱ {ex.time_estimate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Points */}
            <Card className="mb-6">
              <h2 className="font-serif text-lg font-bold text-ink mb-4">✅ 今日行动</h2>
              <ul className="space-y-3">
                {lesson.action_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sage/10 text-sage-dark flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-ink">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Self Assessment */}
            {lesson.self_assessment && (
              <Card className="mb-6">
                <h2 className="font-serif text-lg font-bold text-ink mb-4">📊 自我考核</h2>
                <div className="space-y-3 mb-4">
                  {lesson.self_assessment.criteria?.map((criterion, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-sage/10 text-sage-dark flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-ink">{criterion}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-warm/50 rounded-xl p-4">
                  <p className="text-xs text-muted mb-2">自我评估提示</p>
                  <p className="text-sm text-ink leading-relaxed font-serif">
                    {lesson.self_assessment.reflection_prompt}
                  </p>
                </div>
                <button
                  onClick={() => setAssessmentDone(!assessmentDone)}
                  className={`mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    assessmentDone
                      ? 'bg-sage text-white'
                      : 'bg-white border border-bamboo text-ink hover:border-sage'
                  }`}
                >
                  {assessmentDone ? '✓ 已完成自我考核' : '点击完成自我考核'}
                </button>
              </Card>
            )}

            {/* Reflection Question & Checkin */}
            <Card className="mb-6">
              <h2 className="font-serif text-lg font-bold text-ink mb-4">🤔 今日反思</h2>

              <div className="bg-warm/50 rounded-xl p-4 mb-6">
                <p className="font-serif text-ink font-medium leading-relaxed">
                  {lesson.question}
                </p>
              </div>

              {lesson.checked ? (
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
                    你的回答
                  </label>
                  <div className="bg-parchment rounded-xl p-4 text-sm text-ink leading-relaxed border border-bamboo/30">
                    {lesson.my_answer}
                  </div>
                  <p className="text-xs text-muted mt-2">
                    打卡时间：{lesson.checked_at ? new Date(lesson.checked_at).toLocaleString('zh-CN') : ''}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    写下你的思考 ✍️
                  </label>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="写下你对这个问题的思考。不需要完美，真实就好……"
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-bamboo bg-parchment text-ink focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 transition-colors resize-none text-sm"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted">
                      {answer.length < 5 ? '至少写5个字就可以打卡' : `已写 ${answer.length} 字`}
                    </span>
                    <button
                      onClick={handleCheckin}
                      disabled={submitting || answer.trim().length < 5}
                      className="px-6 py-2.5 bg-sage text-white rounded-xl font-medium hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '打卡中...' : '✅ 完成打卡'}
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* AI Analysis — Show after checkin */}
            {lesson.checked && lesson.my_answer && (
              <AIAnalysisCard
                dayNumber={lesson.day_number}
                answer={lesson.my_answer}
              />
            )}

            {/* After checkin */}
            {lesson.checked && (
              <div className="text-center animate-slide-up">
                <p className="text-muted mb-4">今日功课已完成，明天继续 🌿</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-5 py-2.5 bg-white text-ink rounded-xl border border-bamboo hover:border-sage transition-colors text-sm"
                  >
                    回到仪表盘
                  </button>
                  <button
                    onClick={() => {
                      const nextDay = lesson.day_number < 365 ? lesson.day_number + 1 : 1;
                      router.push(`/daily?day=${nextDay}`);
                    }}
                    className="px-5 py-2.5 bg-sage text-white rounded-xl border border-sage hover:bg-sage-dark transition-colors text-sm"
                  >
                    探索更多日课 →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DailyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DailyPageInner />
    </Suspense>
  );
}
