import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, initDb } from '@/lib/db';
import { signToken, authResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    initDb();
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return Response.json({ error: '邮箱和密码不能为空' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: '密码至少6位' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return Response.json({ error: '该邮箱已注册' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const displayName = name || email.split('@')[0];

    const result = db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).run(email, password_hash, displayName);

    const token = signToken({ userId: result.lastInsertRowid as number, email });

    return authResponse(token, {
      user: {
        id: result.lastInsertRowid,
        email,
        name: displayName,
        streak: 0,
        total_checkins: 0,
        longest_streak: 0,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ error: '注册失败，请稍后再试' }, { status: 500 });
  }
}
