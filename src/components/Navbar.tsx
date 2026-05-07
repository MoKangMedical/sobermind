'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = user
    ? [
        { href: '/dashboard', label: '仪表盘' },
        { href: '/daily', label: '今日日课' },
        { href: '/history', label: '历史' },
        { href: '/categories', label: '分类' },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-[#FAF7F0]/90 backdrop-blur-md border-b border-bamboo/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🌿</span>
          <span className="font-serif font-bold text-xl text-ink group-hover:text-sage transition-colors">
            人间清醒
          </span>
          <span className="hidden sm:inline text-xs text-muted font-sans tracking-widest uppercase">
            SoberMind
          </span>
        </Link>

        {user && (
          <>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'bg-sage/10 text-sage-dark'
                      : 'text-muted hover:text-ink hover:bg-warm'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-warm transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-sage/20 flex items-center justify-center text-sage-dark text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm text-ink">{user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-bamboo/50 py-1 animate-fade-in">
                  {/* Mobile nav items */}
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="md:hidden block px-4 py-2 text-sm text-ink hover:bg-warm transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="md:hidden border-t border-bamboo/30 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!user && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-sage hover:text-sage-dark transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm bg-sage text-white rounded-lg hover:bg-sage-dark transition-colors"
            >
              开始清醒之旅
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
