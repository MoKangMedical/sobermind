import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, initDb } from '@/lib/db';
import { signToken, authResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    initDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: '邮箱和密码不能为空' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare(
      'SELECT id, email, password_hash, name, streak, total_checkins, longest_streak FROM users WHERE email = ?'
    ).get(email) as any;

    if (!user) {
      return Response.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return Response.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email });

    return authResponse(token, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        streak: user.streak,
        total_checkins: user.total_checkins,
        longest_streak: user.longest_streak,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: '登录失败，请稍后再试' }, { status: 500 });
  }
}
