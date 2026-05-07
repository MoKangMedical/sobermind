import { loadAllLessons } from '@/components/StaticUI';
import { Navbar, Footer } from '@/components/StaticUI';
import { LessonRenderer } from '@/components/LessonRenderer';

// Generate all 365 static pages at build time
export async function generateStaticParams() {
  const lessons = loadAllLessons();
  return lessons.map(l => ({ day: String(l.day_number) }));
}

export default function DailyByDayPage({ params }: { params: { day: string } }) {
  const dayNum = parseInt(params.day);
  const lessons = loadAllLessons();
  const lesson = lessons.find(l => l.day_number === dayNum);

  if (!lesson) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-bold text-ink">课程未找到</h1>
          <p className="text-muted mt-2">Day {params.day} 不存在</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm/30">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <LessonRenderer lesson={lesson} />
      </main>
      <Footer />
    </div>
  );
}
