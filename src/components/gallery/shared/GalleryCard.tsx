'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar } from 'lucide-react';
import { Photo } from '@/types';
import { formatDate } from '@/lib/utils';

interface GalleryCardProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  aspectRatioClass?: string;
  showCaption?: boolean;
}

export function GalleryCard({ photo, onClick, aspectRatioClass = 'aspect-square', showCaption = true }: GalleryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={() => onClick(photo)}
      className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 ${aspectRatioClass}`}
    >
      <Image
        src={photo.thumbnailUrl || photo.url}
        alt={photo.title}
        fill
        className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {showCaption && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-white font-serif font-semibold text-sm line-clamp-1">{photo.title}</h4>
            {photo.favorite && <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 mt-1">
            <span>{formatDate(photo.date)}</span>
            {photo.location && (
              <span className="flex items-center gap-1 text-amber-300 truncate">
                <MapPin className="w-3 h-3" /> {photo.location.name}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
