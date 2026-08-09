import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps {
  size?: 'standard' | 'wide' | 'narrow' | 'full';
  children: React.ReactNode;
  className?: string;
}

export function Container({ size = 'standard', children, className }: ContainerProps) {
  const sizes = {
    narrow: 'max-w-4xl',
    standard: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    full: 'w-full',
  };

  return (
    <div className={cn('w-full mx-auto px-4 sm:px-6 md:px-8', sizes[size], className)}>
      {children}
    </div>
  );
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, badge, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between border-b border-white/10 pb-4 mb-6', className)}>
      <div>
        {badge && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
            {badge}
          </span>
        )}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs font-mono text-amber-400/90 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
