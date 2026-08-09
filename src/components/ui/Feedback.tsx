import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  variant?: 'gold' | 'zinc' | 'rose' | 'emerald';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'zinc', children, className }: BadgeProps) {
  const variants = {
    gold: 'bg-amber-400/10 border-amber-400/30 text-amber-300',
    zinc: 'bg-zinc-800/80 border-white/10 text-zinc-300',
    rose: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-mono tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-zinc-800/60 border border-white/5', className)}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="w-full py-16 px-4 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/30 flex flex-col items-center justify-center gap-3">
      <h3 className="text-lg font-serif font-bold text-zinc-200">{title}</h3>
      {description && <p className="text-xs font-mono text-zinc-400 max-w-sm">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
