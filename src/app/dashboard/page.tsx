'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { Card, LoadingSpinner } from '@/components/UI';

interface CheckinData {
  day_number: number;
  answer: string;
  checked_at: string;
}

interface Stats {
  streak: number;
  total: number;
  longest: number;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const [stats, setStats] = useState<Stats>({ streak: 0, total: 0, longest: 0 });
  const [checkedDates, setCheckedDates] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      try {
        const res = await fetch('/api/checkin');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setCheckins(data.checkins || []);
        setStats(data.stats || { streak: 0, total: 0, longest: 0 });
        setCheckedDates(data.checkedDates || []);
      } catch {
        setError('加载数据失败，请刷新重试');
      } finally {
        setPageLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading || pageLoading) return <LoadingSpinner />;
  if (!user) return null;

  const progressPercent = Math.min(100, Math.round((stats.total / 365) * 100));

  // Generate calendar for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const checkinSet = new Set(checkedDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
          <Card className="text-center p-4">
            <div className="text-2xl mb-1">{stats.streak > 0 ? '🔥' : '🌱'}</div>
            <div className="font-serif text-2xl font-bold text-sage">{stats.streak}</div>
            <div className="text-xs text-muted mt-1">连续打卡</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-1">📅</div>
            <div className="font-serif text-2xl font-bold text-sage">{stats.total}</div>
            <div className="text-xs text-muted mt-1">累计打卡</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-1">🏆</div>
            <div className="font-serif text-2xl font-bold text-sage">{stats.longest}</div>
            <div className="text-xs text-muted mt-1">最长连续</div>
          </Card>
        </div>

        {/* Progress */}
        <Card className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg font-bold text-ink">清醒进度</h3>
            <span className="text-sm text-muted">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-warm rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            365天日课已完成 {stats.total} 天
          </p>
        </Card>

        {/* Calendar */}
        <Card className="mb-8 animate-fade-in">
          <h3 className="font-serif text-lg font-bold text-ink mb-4">
            {monthNames[month]} {year}
          </h3>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-xs text-muted py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const checked = checkinSet.has(dateStr);
              const isToday = dateStr === `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all ${
                    checked
                      ? 'bg-sage text-white font-medium'
                      : isToday
                      ? 'bg-sage/10 text-sage-dark font-medium'
                      : 'text-muted hover:bg-warm'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Checkins */}
        <div className="animate-fade-in">
          <h3 className="font-serif text-lg font-bold text-ink mb-4">最近打卡</h3>
          {checkins.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-muted mb-4">还没有打卡记录</p>
              <Link
                href="/daily"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage text-white rounded-lg text-sm font-medium hover:bg-sage-dark transition-colors"
              >
                去完成今日日课
              </Link>
            </Card>
          ) : (
            <div className="space-y-2">
              {checkins.slice(0, 10).map(c => (
                <Card key={c.day_number} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-sage-dark font-bold text-sm flex-shrink-0">
                    第{c.day_number}天
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{c.answer}</p>
                  </div>
                  <span className="text-xs text-muted flex-shrink-0">
                    {new Date(c.checked_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
