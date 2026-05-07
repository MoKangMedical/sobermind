import { NextRequest } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { analyzeReflection } from '@/lib/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    initDb();
    const auth = getAuthUserFromRequest(request);
    if (!auth) {
      return Response.json({ error: '请先登录' }, { status: 401 });
    }

    const { day_number, answer } = await request.json();

    if (!day_number || !answer) {
      return Response.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const db = getDb();

    // Get the lesson
    const lesson = db.prepare(
      'SELECT id, title, category, question, day_number FROM daily_lessons WHERE day_number = ?'
    ).get(day_number) as any;

    if (!lesson) {
      return Response.json({ error: '日课不存在' }, { status: 404 });
    }

    // Get recent history for context
    const recentAnswers = db.prepare(
      `SELECT c.answer, l.title
       FROM checkins c
       JOIN daily_lessons l ON c.day_number = l.day_number
       WHERE c.user_id = ?
       ORDER BY c.checked_at DESC
       LIMIT 5`
    ).all(auth.userId) as { answer: string; title: string }[];

    const userHistory = recentAnswers.map(r => r.answer);

    // Run AI analysis
    const result = await analyzeReflection({
      userAnswer: answer,
      lessonTitle: lesson.title,
      lessonCategory: lesson.category,
      lessonQuestion: lesson.question,
      dayNumber: lesson.day_number,
      userHistory,
    });

    return Response.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return Response.json({ error: '分析失败，请稍后重试' }, { status: 500 });
  }
}
