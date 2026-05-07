'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
}

interface Category {
  category: string;
  count: number;
}

const categoryIcons: Record<string, string> = {
  '藏拙守拙': '🎭',
  '知行合一': '⚡',
  '情绪掌控': '🧘',
  '深度关系': '🤝',
  '自我觉察': '🔍',
  '极简之道': '🍃',
  '逆境成长': '🔥',
  '心流状态': '💫',
  '复利思维': '📈',
  '感恩练习': '🙏',
};

function CategoriesInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('cat');

  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      setPageLoading(true);
      try {
        const url = activeCat
          ? `/api/lessons?category=${encodeURIComponent(activeCat)}`
          : '/api/lessons?page=1';

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setCategories(data.categories || []);
        setLessons(data.lessons || []);
      } catch {
        // ignore
      } finally {
        setPageLoading(false);
      }
    }
    fetchData();
  }, [user, activeCat]);

  if (loading || pageLoading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-ink mb-6">
          {activeCat ? (
            <span>{categoryIcons[activeCat] || '📂'} {activeCat}</span>
          ) : (
            '🗂️ 内容分类'
          )}
        </h1>

        {!activeCat && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-10">
            {categories.map(c => (
              <Link
                key={c.category}
                href={`/categories?cat=${encodeURIComponent(c.category)}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-bamboo/30 hover:border-sage/40 hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{categoryIcons[c.category] || '📂'}</span>
                <div>
                  <div className="font-serif font-bold text-ink text-sm">{c.category}</div>
                  <div className="text-xs text-muted">{c.count} 课</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeCat && (
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm text-sage hover:text-sage-dark mb-6 transition-colors"
          >
            ← 返回全部分类
          </Link>
        )}

        {activeCat && (
          lessons.length === 0 ? (
            <EmptyState icon="📂" title="该分类暂无课程" description="" />
          ) : (
            <div className="space-y-3">
              {lessons.map(lesson => (
                <Link key={lesson.id} href={`/daily?day=${lesson.day_number}`}>
                  <Card className="p-4 flex items-center gap-4 hover:border-sage/40 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      lesson.checked ? 'bg-sage text-white' : 'bg-warm text-muted'
                    }`}>
                      {lesson.day_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-ink">{lesson.title}</h3>
                      <p className="text-xs text-muted truncate">{lesson.question}</p>
                    </div>
                    {lesson.checked && <Badge color="sage">✓</Badge>}
                    <span className="text-muted text-xs">→</span>
                  </Card>
                </Link>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CategoriesInner />
    </Suspense>
  );
}
