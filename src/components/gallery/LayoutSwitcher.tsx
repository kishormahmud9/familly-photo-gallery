'use client';

import React from 'react';
import {
  LayoutGrid,
  Grid3X3,
  Layers,
  BookOpen,
  Camera,
  Clock,
  Film,
  Maximize2,
  Columns,
} from 'lucide-react';
import { GalleryLayoutType } from '@/types';
import { cn } from '@/lib/utils';

interface LayoutSwitcherProps {
  currentLayout: GalleryLayoutType;
  onChange: (layout: GalleryLayoutType) => void;
}

const LAYOUTS: { id: GalleryLayoutType; label: string; icon: React.ReactNode }[] = [
  { id: 'masonry', label: 'Masonry', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'bento', label: 'Bento', icon: <Layers className="w-4 h-4" /> },
  { id: 'editorial', label: 'Editorial', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'polaroid', label: 'Polaroid', icon: <Camera className="w-4 h-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
  { id: 'filmstrip', label: 'Film Strip', icon: <Film className="w-4 h-4" /> },
  { id: 'collage', label: 'Collage', icon: <Columns className="w-4 h-4" /> },
  { id: 'cinematic', label: 'Cinematic', icon: <Maximize2 className="w-4 h-4" /> },
  { id: 'grid', label: 'Standard Grid', icon: <Grid3X3 className="w-4 h-4" /> },
];

export function LayoutSwitcher({ currentLayout, onChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-white/10 text-xs font-mono overflow-x-auto no-scrollbar">
      {LAYOUTS.map((item) => {
        const isActive = currentLayout === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              isActive
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
