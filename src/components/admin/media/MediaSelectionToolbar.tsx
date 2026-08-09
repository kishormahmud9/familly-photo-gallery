'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, FolderPlus, Tag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MediaSelectionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkFavorite: () => void;
  onBulkDelete: () => void;
}

export function MediaSelectionToolbar({
  selectedCount,
  onClearSelection,
  onBulkFavorite,
  onBulkDelete,
}: MediaSelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl p-4 rounded-2xl bg-zinc-900/95 border border-amber-400/40 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-sans"
      >
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-amber-400 text-zinc-950 font-bold font-mono">
            {selectedCount} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Heart className="w-3.5 h-3.5" />} onClick={onBulkFavorite}>
            Favorite
          </Button>
          <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={onBulkDelete}>
            Delete
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
