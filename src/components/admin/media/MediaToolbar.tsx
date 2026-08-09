'use client';

import React from 'react';
import { LayoutGrid, List, SlidersHorizontal, Trash2, Heart, FolderPlus, Tag, CheckSquare, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaToolbarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: any) => void;
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onOpenFiltersMobile: () => void;
}

export function MediaToolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onOpenFiltersMobile,
}: MediaToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs font-sans">
      {/* Selection Summary & Select All Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSelectAll}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-amber-400" />
          ) : (
            <Square className="w-4 h-4 text-zinc-500" />
          )}
          <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
        </button>

        <span className="text-zinc-400 font-mono text-[11px]">
          {selectedCount > 0 ? `${selectedCount} of ${totalCount} selected` : `${totalCount} items`}
        </span>
      </div>

      {/* Controls: Sorting, View Mode & Mobile Filter Trigger */}
      <div className="flex items-center gap-3 justify-end">
        {/* Mobile Filter Button */}
        <button
          onClick={onOpenFiltersMobile}
          className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </button>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-amber-400/50 cursor-pointer"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title">Alphabetical Title</option>
        </select>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-800 border border-white/10">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-1.5 rounded transition-colors cursor-pointer',
              viewMode === 'grid' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            )}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-1.5 rounded transition-colors cursor-pointer',
              viewMode === 'list' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            )}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
