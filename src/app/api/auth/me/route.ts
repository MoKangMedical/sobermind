import { NextRequest } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    initDb();
    const auth = getAuthUserFromRequest(request);
    if (!auth) {
      return Response.json({ error: '未登录' }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare(
      'SELECT id, email, name, streak, total_checkins, longest_streak FROM users WHERE id = ?'
    ).get(auth.userId) as any;

    if (!user) {
      return Response.json({ error: '用户不存在' }, { status: 404 });
    }

    return Response.json({ user });
  } catch {
    return Response.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}
