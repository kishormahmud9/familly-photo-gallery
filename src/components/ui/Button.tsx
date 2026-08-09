import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, children, className, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono text-xs tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl';

    const variants = {
      primary:
        'bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 active:scale-[0.98] shadow-md shadow-amber-400/10',
      secondary:
        'bg-zinc-800 text-zinc-100 border border-white/10 hover:border-amber-400/40 hover:text-white hover:bg-zinc-750 active:scale-[0.98]',
      outline:
        'bg-transparent text-zinc-300 border border-white/15 hover:border-white/40 hover:text-white active:scale-[0.98]',
      ghost:
        'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5 active:scale-[0.98]',
      danger:
        'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 gap-1.5 text-[11px]',
      md: 'px-4 py-2.5 gap-2 text-xs',
      lg: 'px-6 py-3.5 gap-2.5 text-sm font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = 'ghost', size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'p-1.5 rounded-lg',
      md: 'p-2.5 rounded-xl',
      lg: 'p-3.5 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center transition-all cursor-pointer text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95',
          sizes[size],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';
