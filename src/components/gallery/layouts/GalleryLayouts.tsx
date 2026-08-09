'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Photo } from '@/types';
import { formatDate } from '@/lib/utils';
import { GalleryCard } from '../shared/GalleryCard';

interface GalleryLayoutProps {
  photos: Photo[];
  onSelect: (photo: Photo) => void;
}

// 1. Standard Grid
export function StandardGridLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {photos.map((photo) => (
        <GalleryCard key={photo.id} photo={photo} onClick={onSelect} />
      ))}
    </div>
  );
}

// 2. Masonry Layout
export function MasonryLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.04 }}
          onClick={() => onSelect(photo)}
          className="relative group cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border border-white/10 break-inside-avoid"
        >
          <Image
            src={photo.url}
            alt={photo.title}
            width={photo.width}
            height={photo.height}
            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
            <h3 className="text-white font-serif font-medium text-base leading-tight">{photo.title}</h3>
            <p className="text-xs text-amber-300/90 font-mono mt-1">{formatDate(photo.date)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// 3. Bento Grid
export function BentoLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[240px]">
      {photos.map((photo, index) => {
        const isLarge = index % 5 === 0;
        const isTall = index % 3 === 1;
        const spanClasses = isLarge
          ? 'md:col-span-2 md:row-span-2'
          : isTall
          ? 'md:col-span-1 md:row-span-2'
          : 'md:col-span-1 md:row-span-1';

        return (
          <GalleryCard
            key={photo.id}
            photo={photo}
            onClick={onSelect}
            aspectRatioClass={spanClasses}
          />
        );
      })}
    </div>
  );
}

// 4. Editorial Layout with handwritten annotation
export function EditorialLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="space-y-16 max-w-5xl mx-auto">
      {photos.map((photo, index) => {
        const isReversed = index % 2 !== 0;

        return (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            onClick={() => onSelect(photo)}
            className={`flex flex-col ${
              isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
            } items-center gap-8 group cursor-pointer p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-amber-400/20 transition-all`}
          >
            <div className="relative w-full md:w-3/5 h-[380px] overflow-hidden rounded-2xl">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="w-full md:w-2/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                  {photo.albumName || 'Archival Memory'}
                </span>
                <span className="font-signature text-amber-300/80 text-lg">captured moment</span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                {photo.title}
              </h2>
              {photo.description && (
                <p className="text-sm text-zinc-400 leading-relaxed font-light">{photo.description}</p>
              )}
              <div className="pt-2 text-xs font-mono text-zinc-500">
                <span>{formatDate(photo.date)}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// 5. Polaroid Layout
export function PolaroidLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-4">
      {photos.map((photo, index) => {
        const rotation = ((index % 5) - 2) * 2;

        return (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => onSelect(photo)}
            style={{ transform: `rotate(${rotation}deg)` }}
            className="group cursor-pointer bg-zinc-100 text-zinc-900 p-4 rounded shadow-2xl hover:rotate-0 hover:scale-105 transition-all duration-300 border border-zinc-300"
          >
            <div className="relative w-full aspect-square bg-zinc-900 overflow-hidden rounded-sm mb-4">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="px-1 text-center space-y-1">
              <h3 className="font-serif text-lg font-bold tracking-tight text-zinc-900">{photo.title}</h3>
              <p className="font-signature text-amber-800 text-base">"{formatDate(photo.date)}"</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// 6. Timeline Layout
export function TimelineLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="space-y-12 max-w-4xl mx-auto border-l-2 border-amber-400/20 pl-6 md:pl-8">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          onClick={() => onSelect(photo)}
          className="relative group cursor-pointer space-y-3"
        >
          {/* Timeline Node Dot */}
          <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-amber-400 border-4 border-zinc-950 shadow-md" />
          
          <div className="flex items-center gap-3">
            <span className="text-2xl font-serif font-bold text-amber-400">{photo.year}</span>
            <span className="font-signature text-zinc-400 text-lg">memory</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-amber-400/30 transition-all">
            <div className="relative w-full md:w-48 h-36 rounded-xl overflow-hidden shrink-0">
              <Image src={photo.url} alt={photo.title} fill className="object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                {photo.title}
              </h3>
              <p className="text-xs text-zinc-400 font-light line-clamp-2">{photo.description}</p>
              <span className="text-[11px] font-mono text-zinc-500 block">{formatDate(photo.date)}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// 7. Film Strip Layout
export function FilmStripLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-6">
      <div className="flex gap-6 min-w-max px-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            onClick={() => onSelect(photo)}
            className="w-72 shrink-0 group cursor-pointer bg-zinc-900 p-3 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all space-y-3"
          >
            <div className="relative w-full h-80 rounded-xl overflow-hidden">
              <Image src={photo.url} alt={photo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="px-1">
              <h4 className="text-sm font-serif font-bold text-white line-clamp-1">{photo.title}</h4>
              <span className="text-[11px] font-mono text-amber-400">{formatDate(photo.date)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 8. Collage Layout
export function CollageLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {photos.map((photo, index) => {
        const colSpan = (index % 3 === 0) ? 'col-span-2 md:col-span-3' : 'col-span-1 md:col-span-2';
        return (
          <GalleryCard key={photo.id} photo={photo} onClick={onSelect} aspectRatioClass={`h-64 ${colSpan}`} />
        );
      })}
    </div>
  );
}

// 9. Cinematic Fullscreen Gallery
export function CinematicLayout({ photos, onSelect }: GalleryLayoutProps) {
  return (
    <div className="space-y-16">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          onClick={() => onSelect(photo)}
          className="relative w-full h-[70vh] rounded-3xl overflow-hidden group cursor-pointer border border-white/10 shadow-2xl"
        >
          <Image src={photo.url} alt={photo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 md:p-12 flex flex-col justify-end">
            <span className="font-signature text-amber-300 text-xl">Cinematic Memory</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mt-1">{photo.title}</h2>
            <p className="text-xs font-mono text-zinc-400 mt-2">{formatDate(photo.date)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
