import { NextRequest } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    initDb();
    const auth = getAuthUserFromRequest(request);

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const dayNumber = searchParams.get('day');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 10;

    let query = 'SELECT * FROM daily_lessons';
    const params: any[] = [];

    if (dayNumber) {
      query += ' WHERE day_number = ?';
      params.push(parseInt(dayNumber));
    } else if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY day_number ASC';

    if (!dayNumber) {
      query += ' LIMIT ? OFFSET ?';
      params.push(pageSize, (page - 1) * pageSize);
    }

    const lessons = db.prepare(query).all(...params) as any[];

    // Parse JSON fields
    const parsed = lessons.map(l => ({
      ...l,
      action_points: JSON.parse(l.action_points),
      exercises: JSON.parse(l.exercises || '[]'),
      self_assessment: JSON.parse(l.self_assessment || '{}'),
    }));

    // If user is logged in, attach checkin status
    if (auth) {
      const dayNumbers = parsed.map(l => l.day_number);
      if (dayNumbers.length > 0) {
        const placeholders = dayNumbers.map(() => '?').join(',');
        const checkins = db.prepare(
          `SELECT day_number, answer, checked_at FROM checkins WHERE user_id = ? AND day_number IN (${placeholders})`
        ).all(auth.userId, ...dayNumbers) as any[];

        const checkinMap = new Map(checkins.map(c => [c.day_number, c]));

        for (const lesson of parsed) {
          const c = checkinMap.get(lesson.day_number);
          lesson.checked = !!c;
          lesson.my_answer = c?.answer || '';
          lesson.checked_at = c?.checked_at || null;
        }
      }
    }

    // Get total count for pagination
    let totalQuery = 'SELECT COUNT(*) as total FROM daily_lessons';
    if (category) {
      totalQuery += ' WHERE category = ?';
    }
    const totalResult = db.prepare(totalQuery).all(...(category ? [category] : [])) as any[];
    const total = totalResult[0]?.total || 0;

    // Get categories
    const categories = db.prepare(
      'SELECT category, COUNT(*) as count FROM daily_lessons GROUP BY category ORDER BY count DESC'
    ).all() as any[];

    return Response.json({
      lessons: parsed,
      total,
      page,
      pageSize,
      categories,
    });
  } catch (error) {
    console.error('Lessons error:', error);
    return Response.json({ error: '获取课程失败' }, { status: 500 });
  }
}
