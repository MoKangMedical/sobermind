// Shared lesson renderer — used by daily, daily/[day], and categories/[cat] pages

import Link from 'next/link';
import { Lesson } from './StaticUI';
import { getLessonAudio } from '@/lib/lesson-audio';

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
          <span className="px-3 py-1 bg-sage/10 text-sage-dark rounded-full text-sm font-medium">
            Day {lesson.day_number}
          </span>
          <Link
            href={`/categories/${encodeURIComponent(lesson.category)}`}
            className="px-3 py-1 bg-bamboo/20 text-ink/70 rounded-full text-sm hover:bg-bamboo/40 transition-colors"
          >
            {lesson.category}
          </Link>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink leading-tight mb-4">
          {lesson.title}
        </h1>
        <blockquote className="border-l-4 border-sage/30 pl-4 py-1 text-muted italic">
          「{lesson.quote}」—— {lesson.quote_author}
        </blockquote>
      </div>

      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-bamboo/20 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">男声导读</h2>
            <p className="text-sm text-muted mt-1">{audio.voiceLabel}</p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-sage/10 text-sage-dark rounded-full text-xs font-medium">
            {audio.available ? '可播放' : '音频准备中'}
          </span>
        </div>
        {audio.available ? (
          <audio controls preload="none" src={audio.url} className="w-full mt-5" />
        ) : null}
      </section>

      {/* Reading (intro) */}
      <article className="prose prose-lg max-w-none mb-10">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-bamboo/20 mb-8">
          {lesson.reading.split('\n\n').map((p, i) => (
            <p key={i} className="text-ink/80 leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </div>

        {/* Body */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-bamboo/20 mb-8 lesson-body">
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
          <div className="bg-sage/5 rounded-2xl p-6 sm:p-8 border border-sage/10 mb-8">
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
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">📝 今日练习</h2>
        <div className="space-y-4">
          {lesson.exercises.map((ex, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-bamboo/20 hover:border-sage/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sage text-white text-sm flex items-center justify-center font-bold">
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

      {/* Self-assessment */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">✅ 自我考核</h2>
        <div className="bg-white rounded-xl p-6 border border-bamboo/20">
          <ul className="space-y-3 mb-4">
            {lesson.self_assessment.criteria.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 accent-sage" />
                <span className="text-ink/80">{c}</span>
              </li>
            ))}
          </ul>
          {lesson.self_assessment.reflection_prompt && (
            <div className="border-t border-bamboo/20 pt-4 mt-4">
              <p className="text-sage-dark font-medium mb-2">🤔 反思引导</p>
              <p className="text-muted">{lesson.self_assessment.reflection_prompt}</p>
            </div>
          )}
        </div>
      </section>

      {/* Reflection question */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">💭 今日反思</h2>
        <div className="bg-white rounded-xl p-6 border border-bamboo/20">
          <p className="text-ink font-medium mb-4">{lesson.question}</p>
          <textarea
            className="w-full h-32 p-4 border border-bamboo/30 rounded-lg text-ink/80 resize-y focus:outline-none focus:border-sage/50 focus:ring-1 focus:ring-sage/20"
            placeholder="写下你的思考…"
          />
          <p className="text-xs text-muted mt-2">💡 提示：在本地部署后可接入 DeepSeek AI 获得智能分析反馈</p>
        </div>
      </section>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-bamboo/30">
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
