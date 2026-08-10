'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Upload,
  FolderOpen,
  Users,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/photos', label: 'Photo Manager', icon: <ImageIcon className="w-4 h-4" /> },
  { href: '/admin/upload', label: 'Upload Center', icon: <Upload className="w-4 h-4" /> },
  { href: '/admin/albums', label: 'Albums', icon: <FolderOpen className="w-4 h-4" /> },
  { href: '/admin/people', label: 'People', icon: <Users className="w-4 h-4" /> },
];

function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/admin/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-xs font-mono text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
      aria-label="Sign out of admin dashboard"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Sign Out
    </button>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page renders without sidebar — it has its own full-page layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Generate dynamic breadcrumb segments
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900/60 border border-white/10 rounded-2xl p-4 h-fit space-y-6 shrink-0">
        <div className="space-y-1 px-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
            Control Panel
          </span>
          <h2 className="text-xl font-serif font-bold text-white">Archive Admin</h2>
        </div>

        <nav className="space-y-1">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all',
                  isActive
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10 px-2 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Archive
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Admin View Container with Breadcrumb Topbar */}
      <main className="flex-1 w-full space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 border-b border-white/10 pb-3">
          <Link href="/admin" className="hover:text-amber-300">
            Admin
          </Link>
          {pathSegments.slice(1).map((seg, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="capitalize text-zinc-200">{seg}</span>
            </React.Fragment>
          ))}
        </div>

        {children}
      </main>
    </div>
  );
}
