import Link from 'next/link';
import { Navbar, Footer, CATEGORIES, loadAllLessons } from '@/components/StaticUI';

export default function CategoriesPage() {
  const lessons = loadAllLessons();
  
  // Build category summary
  const categoryData = CATEGORIES.map(cat => {
    const catLessons = lessons.filter(l => l.category === cat.name);
    return {
      ...cat,
      count: catLessons.length,
      days: catLessons.map(l => l.day_number).sort((a, b) => a - b),
    };
  });

  return (
    <div className="min-h-screen bg-warm/30">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-3">
            课程分类
          </h1>
          <p className="text-muted">10 个生命维度 · 365 天系统成长</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {categoryData.map(cat => (
            <Link
              key={cat.name}
              href={`/categories/${encodeURIComponent(cat.name)}`}
              className="block bg-white rounded-2xl p-6 border border-bamboo/20 hover:border-sage/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h2 className="font-serif text-xl font-bold text-ink group-hover:text-sage-dark transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-muted">{cat.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted">
                <span>{cat.count} 节课</span>
                <span>Day {cat.days[0]}–{cat.days[cat.days.length - 1]}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
