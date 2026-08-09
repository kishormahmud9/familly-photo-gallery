'use client';

import React from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';

export function NavigationFooter() {
  const footerLinks = [
    { href: '/photos', label: 'Photos' },
    { href: '/albums', label: 'Albums' },
    { href: '/people', label: 'People' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <footer className="w-full border-t border-white/10 mt-24 bg-zinc-950 py-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Camera className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-white text-base">Vance Archive</span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-amber-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-[11px] font-mono text-zinc-500 text-center md:text-right">
          © {new Date().getFullYear()} Vance Family Digital Archive. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
