'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl">🌿</span>
            <span className="font-serif font-bold text-xl text-ink">人间清醒</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-ink mb-2">开始清醒之旅</h1>
          <p className="text-muted">用365天，修炼一个清醒的自己</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-bamboo/30 p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">你的名字</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="怎么称呼你？"
              className="w-full px-4 py-3 rounded-xl border border-bamboo bg-parchment text-ink focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-bamboo bg-parchment text-ink focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少6位"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-bamboo bg-parchment text-ink focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sage text-white rounded-xl font-medium hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '注册中...' : '🌿 开始清醒之旅'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-muted">
          已有账号？{' '}
          <Link href="/login" className="text-sage hover:text-sage-dark font-medium">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
