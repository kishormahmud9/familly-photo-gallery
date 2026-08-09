'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, FolderOpen, Camera, Tag } from 'lucide-react';
import { Photo } from '@/types';
import { formatDate } from '@/lib/utils';

interface MediaDetailDrawerProps {
  photo: Photo | null;
  onClose: () => void;
}

export function MediaDetailDrawer({ photo, onClose }: MediaDetailDrawerProps) {
  if (!photo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-md h-full bg-zinc-900 border-l border-white/10 p-6 overflow-y-auto space-y-6 text-zinc-100 font-sans text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-[11px] font-sans uppercase tracking-widest text-amber-400">
              Photo Inspection
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Preview Thumbnail */}
          <div className="relative w-full h-60 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10">
            <Image src={photo.url} alt={photo.title} fill className="object-contain p-2" />
          </div>

          {/* Memory Section */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Title & Details</span>
            <h3 className="text-xl font-serif font-bold text-white">{photo.title}</h3>
            {photo.description && <p className="text-zinc-400 font-light leading-relaxed">{photo.description}</p>}
          </div>

          {/* Attributes */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Captured Date
              </span>
              <span className="font-mono text-zinc-200">{formatDate(photo.date)}</span>
            </div>

            {photo.location && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Location
                </span>
                <span className="text-zinc-200">{photo.location.name}</span>
              </div>
            )}

            {photo.albumName && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" /> Album
                </span>
                <span className="text-amber-300 font-medium">{photo.albumName}</span>
              </div>
            )}
          </div>

          {/* Camera Info */}
          {photo.cameraInfo && (
            <div className="space-y-2 pt-4 border-t border-white/10 font-mono text-[11px]">
              <span className="text-[10px] font-sans text-zinc-500 uppercase font-normal block">
                Technical Metadata
              </span>
              <p className="text-zinc-300">
                {photo.cameraInfo.make} {photo.cameraInfo.model}
              </p>
              <p className="text-zinc-400">
                {photo.cameraInfo.focalLength} • {photo.cameraInfo.aperture} • ISO {photo.cameraInfo.iso}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
