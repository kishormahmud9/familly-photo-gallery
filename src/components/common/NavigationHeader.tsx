'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Camera,
  Image as ImageIcon,
  FolderOpen,
  Users,
  Calendar,
  Heart,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function NavigationHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/photos', label: 'All Photos', icon: <ImageIcon className="w-4 h-4" /> },
    { href: '/albums', label: 'Albums', icon: <FolderOpen className="w-4 h-4" /> },
    { href: '/people', label: 'People', icon: <Users className="w-4 h-4" /> },
    { href: '/timeline', label: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
    { href: '/favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full header-glass">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-amber-400/10 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg md:text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
              My Archive
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
              Family Photo Gallery
            </p>
          </div>
        </Link>

        {/* Desktop Navbar */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1.5 rounded-full border border-white/10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono transition-all',
                  isActive
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 border border-white/10 hover:border-amber-400/40 text-xs font-mono text-zinc-200 hover:text-white transition-all shadow-sm"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin Dashboard</span>
          </Link>

          {/* Hamburger Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-zinc-950/95 p-4 space-y-2"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono transition-all',
                    isActive
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'text-zinc-300 hover:bg-white/5'
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
