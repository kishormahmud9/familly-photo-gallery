import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/10 pb-6 mb-8">
      <div className="space-y-1">
        {badge && (
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
            {badge}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs md:text-sm font-mono text-zinc-400 font-light mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
