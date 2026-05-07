import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'sobermind-secret-change-in-production-2024';
const TOKEN_NAME = 'sobermind_token';

export interface AuthUser {
  userId: number;
  email: string;
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

/** Server Component / Route Handler usage */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Middleware / Route Handler usage with NextRequest */
export function getAuthUserFromRequest(request: NextRequest): AuthUser | null {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/** Require auth for API routes. Returns user or throws Response. */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw Response.json({ error: '请先登录' }, { status: 401 });
  }
  return user;
}

/** Create auth response with cookie set */
export async function authResponse(token: string, data: object): Promise<Response> {
  const response = Response.json(data);
  response.headers.set(
    'Set-Cookie',
    `${TOKEN_NAME}=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
  return response;
}
