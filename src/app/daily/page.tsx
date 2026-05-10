import { Navbar, Footer, loadAllLessons, getTodayDayNumber } from '@/components/StaticUI';
import { LessonRenderer } from '@/components/LessonRenderer';

export default function DailyPage() {
  const lessons = loadAllLessons();
  const today = getTodayDayNumber();
  const lesson = lessons.find(l => l.day_number === today);

  if (!lesson) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-bold text-ink">课程加载中…</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm/30">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <LessonRenderer lesson={lesson} totalDays={lessons.length} />
      </main>
      <Footer />
    </div>
  );
}
