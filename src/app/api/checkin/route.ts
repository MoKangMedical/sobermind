import { NextRequest } from 'next/server';
import { getDb, initDb, recalcUserStreak } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    initDb();
    const auth = getAuthUserFromRequest(request);
    if (!auth) {
      return Response.json({ error: '请先登录' }, { status: 401 });
    }

    const { day_number, answer, lesson_id } = await request.json();

    if (!day_number || !lesson_id) {
      return Response.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (!answer || answer.trim().length < 5) {
      return Response.json({ error: '请至少写一点思考再打卡，哪怕一句话也好' }, { status: 400 });
    }

    const db = getDb();

    // Check if already checked in today
    const existing = db.prepare(
      'SELECT id FROM checkins WHERE user_id = ? AND day_number = ?'
    ).get(auth.userId, day_number);

    if (existing) {
      return Response.json({ error: '今日已打卡', status: 'already_checked' }, { status: 409 });
    }

    const result = db.prepare(
      'INSERT INTO checkins (user_id, lesson_id, day_number, answer) VALUES (?, ?, ?, ?)'
    ).run(auth.userId, lesson_id, day_number, answer.trim());

    const stats = recalcUserStreak(auth.userId);

    return Response.json({
      success: true,
      checkin_id: result.lastInsertRowid,
      stats,
    });
  } catch (error) {
    console.error('Checkin error:', error);
    return Response.json({ error: '打卡失败' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    initDb();
    const auth = getAuthUserFromRequest(request);
    if (!auth) {
      return Response.json({ error: '请先登录' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const month = searchParams.get('month');

    let query = 'SELECT day_number, answer, checked_at FROM checkins WHERE user_id = ?';
    const params: any[] = [auth.userId];

    if (month) {
      query += " AND strftime('%Y', checked_at) = ? AND strftime('%m', checked_at) = ?";
      params.push(year, month.padStart(2, '0'));
    } else {
      query += " AND strftime('%Y', checked_at) = ?";
      params.push(year);
    }

    query += ' ORDER BY checked_at DESC';

    const checkins = db.prepare(query).all(...params) as any[];

    // Also get stats
    const user = db.prepare(
      'SELECT streak, total_checkins, longest_streak FROM users WHERE id = ?'
    ).get(auth.userId) as any;

    // Get all checkin days for calendar
    const allDays = db.prepare(
      "SELECT DISTINCT date(checked_at) as date FROM checkins WHERE user_id = ? AND strftime('%Y', checked_at) = ?"
    ).all(auth.userId, year) as { date: string }[];

    return Response.json({
      checkins,
      stats: {
        streak: user?.streak || 0,
        total: user?.total_checkins || 0,
        longest: user?.longest_streak || 0,
      },
      checkedDates: allDays.map(d => d.date),
    });
  } catch (error) {
    console.error('Get checkins error:', error);
    return Response.json({ error: '获取打卡记录失败' }, { status: 500 });
  }
}
