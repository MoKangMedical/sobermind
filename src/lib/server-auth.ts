'use server';

import { cookies } from 'next/headers';
import { verifyToken, AuthUser } from '@/lib/auth';

export async function getServerAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('sobermind_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
