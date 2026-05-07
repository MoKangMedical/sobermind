import Link from 'next/link';
import { loadAllLessons, CATEGORIES } from '@/components/StaticUI';
import { Navbar, Footer } from '@/components/StaticUI';
import { LessonRenderer } from '@/components/LessonRenderer';

export async function generateStaticParams() {
  return CATEGORIES.map(c => ({ cat: encodeURIComponent(c.name) }));
}

export default function CategoryDetailPage({ params }: { params: { cat: string } }) {
  const catName = decodeURIComponent(params.cat);
  const allLessons = loadAllLessons();
  const catLessons = allLessons
    .filter(l => l.category === catName)
    .sort((a, b) => a.day_number - b.day_number);

  const catInfo = CATEGORIES.find(c => c.name === catName);

  return (
    <div className="min-h-screen bg-warm/30">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <Link href="/categories" className="text-sage hover:text-sage-dark text-sm mb-3 inline-block">
            ← 返回分类
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{catInfo?.icon}</span>
            <div>
              <h1 className="font-serif text-3xl font-bold text-ink">{catName}</h1>
              <p className="text-muted">{catInfo?.desc} · {catLessons.length} 节</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {catLessons.map(l => (
            <Link
              key={l.day_number}
              href={`/daily/${l.day_number}`}
              className="block bg-white rounded-xl p-5 border border-bamboo/20 hover:border-sage/30 hover:shadow-sm transition-all group"
            >
              <span className="text-xs text-sage font-medium">Day {l.day_number}</span>
              <h3 className="font-serif text-lg font-bold text-ink mt-1 mb-2 group-hover:text-sage-dark transition-colors">
                {l.title}
              </h3>
              <p className="text-xs text-muted line-clamp-2">{l.content}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
