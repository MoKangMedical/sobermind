'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { Card, Badge, LoadingSpinner, EmptyState } from '@/components/UI';

interface Lesson {
  id: number;
  day_number: number;
  title: string;
  category: string;
  question: string;
  checked?: boolean;
  my_answer?: string;
  checked_at?: string;
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchLessons() {
      try {
        const res = await fetch(`/api/lessons?page=${page}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setLessons(data.lessons || []);
        setTotal(data.total || 0);
      } catch {
        setError('加载失败');
      } finally {
        setPageLoading(false);
      }
    }
    fetchLessons();
  }, [user, page]);

  if (loading || pageLoading) return <LoadingSpinner />;
  if (!user) return null;

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-ink mb-6">📚 全部日课</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        {lessons.length === 0 ? (
          <EmptyState icon="📚" title="暂无课程" description="数据库为空，请先初始化课程数据" />
        ) : (
          <div className="space-y-3">
            {lessons.map(lesson => (
              <Link key={lesson.id} href={`/daily?day=${lesson.day_number}`}>
                <Card className="p-4 flex items-center gap-4 hover:border-sage/40 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    lesson.checked
                      ? 'bg-sage text-white'
                      : 'bg-warm text-muted'
                  }`}>
                    {lesson.day_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-serif font-bold text-ink">{lesson.title}</h3>
                      <Badge>{lesson.category}</Badge>
                      {lesson.checked && <Badge color="sage">✓</Badge>}
                    </div>
                    <p className="text-xs text-muted truncate">
                      {lesson.checked ? `「${lesson.my_answer?.slice(0, 60)}...」` : lesson.question}
                    </p>
                  </div>
                  <span className="text-muted text-xs">→</span>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm rounded-lg border border-bamboo hover:bg-warm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <span className="text-sm text-muted">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm rounded-lg border border-bamboo hover:bg-warm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
