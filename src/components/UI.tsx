'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: Props) {
  return (
    <div className={`bg-white rounded-2xl border border-bamboo/30 p-6 shadow-sm card-hover ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, color = 'sage' }: { children: ReactNode; color?: 'sage' | 'gold' | 'muted' }) {
  const colors = {
    sage: 'bg-sage/10 text-sage-dark',
    gold: 'bg-clay-light/50 text-clay',
    muted: 'bg-warm text-muted',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-serif text-xl text-ink mb-2">{title}</h3>
      <p className="text-muted mb-4">{description}</p>
      {action}
    </div>
  );
}
