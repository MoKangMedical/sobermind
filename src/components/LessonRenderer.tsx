// Shared lesson renderer — used by daily, daily/[day], and categories/[cat] pages

import Link from 'next/link';
import { Lesson } from './StaticUI';
import { getLessonAudio } from '@/lib/lesson-audio';
import { LearningLoopPanel } from './LearningLoopPanel';

export function LessonRenderer({ lesson, totalDays = 365 }: { lesson: Lesson; totalDays?: number }) {
  const prevDay = lesson.day_number <= 1 ? totalDays : lesson.day_number - 1;
  const nextDay = lesson.day_number >= totalDays ? 1 : lesson.day_number + 1;
  const audio = lesson.audio?.url
    ? {
        ...getLessonAudio(lesson.day_number),
        ...lesson.audio,
        available: true,
        url: lesson.audio.url,
      }
    : getLessonAudio(lesson.day_number);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-sage/10 text-sage rounded-full text-sm font-medium border border-sage/20">
            Day {lesson.day_number}
          </span>
          <Link
            href={`/categories/${encodeURIComponent(lesson.category)}`}
            className="px-3 py-1 bg-parchment text-muted rounded-full text-sm hover:text-sage transition-colors border border-bamboo"
          >
            {lesson.category}
          </Link>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink leading-tight mb-4">
          {lesson.title}
        </h1>
        <blockquote className="border-l-4 border-sage/50 pl-4 py-1 text-muted italic">
          「{lesson.quote}」—— {lesson.quote_author}
        </blockquote>
      </div>

      <section className="bg-parchment rounded-2xl p-5 sm:p-6 border border-bamboo mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">学院式男声讲解</h2>
            <p className="text-sm text-muted mt-1">
              {[audio.voiceLabel, '导读 + 框架 + 行动题', audio.durationLabel].filter(Boolean).join(' · ')}
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-sage/10 text-sage rounded-full text-xs font-medium border border-sage/20">
            {audio.available ? '可播放' : '音频准备中'}
          </span>
        </div>
        {audio.available ? (
          <audio controls preload="none" src={audio.url} className="w-full mt-5" />
        ) : null}
      </section>

      {/* Reading (intro) */}
      <article className="prose prose-lg max-w-none mb-10">
        <div className="bg-parchment rounded-2xl p-6 sm:p-8 border border-bamboo mb-8">
          {lesson.reading.split('\n\n').map((p, i) => (
            <p key={i} className="text-ink/80 leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </div>

        {/* Body */}
        <div className="bg-parchment rounded-2xl p-6 sm:p-8 border border-bamboo mb-8 lesson-body">
          {lesson.body.split('\n\n').map((section, i) => {
            if (section.startsWith('## ')) {
              const title = section.replace(/^## /, '').replace(/^[一二三四五六七八九十]、/, '').trim();
              return (
                <h2 key={i} className="font-serif text-xl font-bold text-ink mt-8 mb-4 first:mt-0">
                  {title}
                </h2>
              );
            }
            if (section.startsWith('### ')) {
              return (
                <h3 key={i} className="font-serif text-lg font-semibold text-sage-dark mt-6 mb-3">
                  {section.replace(/^### /, '').trim()}
                </h3>
              );
            }
            return (
              <p key={i} className="text-ink/80 leading-relaxed mb-4 last:mb-0 whitespace-pre-line">
                {section}
              </p>
            );
          })}
        </div>

        {/* Closing */}
        {lesson.closing && (
          <div className="bg-sage/5 rounded-2xl p-6 sm:p-8 border border-sage/20 mb-8">
            {lesson.closing.split('\n\n').map((p, i) => (
              <p key={i} className="text-ink/80 leading-relaxed mb-3 last:mb-0">
                {p}
              </p>
            ))}
          </div>
        )}
      </article>

      {/* Exercises */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">📝 交互练习题</h2>
        <div className="space-y-4">
          {lesson.exercises.map((ex, i) => (
            <div key={i} className="bg-parchment rounded-xl p-5 border border-bamboo hover:border-sage/40 transition-colors">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sage text-zinc-950 text-sm flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-ink font-medium mb-2">{ex.instruction}</p>
                  <div className="flex gap-4 text-xs text-muted">
                    <span>🎯 {ex.purpose}</span>
                    <span>⏱ {ex.time_estimate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <LearningLoopPanel
        dayNumber={lesson.day_number}
        title={lesson.title}
        category={lesson.category}
        criteria={lesson.self_assessment.criteria}
        question={lesson.question}
        totalDays={totalDays}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-bamboo">
        <Link
          href={`/daily/${prevDay}`}
          className="text-sage hover:text-sage-dark font-medium text-sm"
        >
          ← 前一天
        </Link>
        <Link
          href="/categories"
          className="text-muted hover:text-ink text-sm"
        >
          浏览分类
        </Link>
        <Link
          href={`/daily/${nextDay}`}
          className="text-sage hover:text-sage-dark font-medium text-sm"
        >
          后一天 →
        </Link>
      </div>
    </>
  );
}
