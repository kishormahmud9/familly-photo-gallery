'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  MapPin,
  Camera,
  User,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLightbox } from '@/context/LightboxContext';
import { formatDate } from '@/lib/utils';
import { PhotoService } from '@/services/photoService';
import { Person } from '@/types';

export function LightboxModal() {
  const { activePhoto, isOpen, closeLightbox, nextPhoto, prevPhoto, photos } = useLightbox();
  const [people, setPeople] = useState<Person[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showExif, setShowExif] = useState(false);

  useEffect(() => {
    if (activePhoto) {
      setIsFavorited(activePhoto.favorite);
      if (activePhoto.peopleIds && activePhoto.peopleIds.length > 0) {
        Promise.all(activePhoto.peopleIds.map((id) => PhotoService.getPersonById(id))).then((res) =>
          setPeople(res.filter(Boolean) as Person[])
        );
      } else {
        setPeople([]);
      }
    }
  }, [activePhoto]);

  // Keyboard navigation & accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox, nextPhoto, prevPhoto]);

  if (!isOpen || !activePhoto) return null;

  const currentIndex = photos.findIndex((p) => p.id === activePhoto.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
        {/* Top Minimal Toolbar */}
        <div className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <span className="text-xs font-sans text-zinc-400 font-medium">
              {currentIndex >= 0 ? `${currentIndex + 1} of ${photos.length}` : 'Memory'}
            </span>
            {activePhoto.featured && (
              <span className="font-signature text-amber-300 text-base">treasured moment</span>
            )}
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isFavorited
                  ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                  : 'text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Save to Favorites"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-400' : ''}`} />
            </button>
            <button
              onClick={closeLightbox}
              className="p-2.5 rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full border border-white/10 bg-black/40 text-zinc-300 hover:text-white hover:bg-black/60 transition-all cursor-pointer backdrop-blur-md"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full border border-white/10 bg-black/40 text-zinc-300 hover:text-white hover:bg-black/60 transition-all cursor-pointer backdrop-blur-md"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Lightbox Content Container */}
        <div className="w-full h-full max-w-[1400px] mx-auto p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 pt-20 pb-8">
          {/* Main Visual Image View */}
          <motion.div
            key={activePhoto.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full md:w-3/4 h-[55vh] md:h-[80vh] flex items-center justify-center"
          >
            <Image
              src={activePhoto.url}
              alt={activePhoto.title}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 75vw"
            />
          </motion.div>

          {/* Refined Metadata Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-1/4 max-h-[80vh] overflow-y-auto bg-zinc-900/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6"
          >
            {/* Primary Section: Memory Title & Date */}
            <div className="space-y-3">
              <span className="text-[11px] font-sans uppercase tracking-widest text-amber-400 block">
                {formatDate(activePhoto.date)}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                {activePhoto.title}
              </h2>
              {activePhoto.description && (
                <p className="text-sm font-sans font-light text-zinc-300 leading-relaxed pt-1">
                  {activePhoto.description}
                </p>
              )}
            </div>

            {/* Secondary Section: Contextual Associations */}
            <div className="space-y-4 pt-4 border-t border-white/10 text-xs font-sans">
              {/* Location */}
              {activePhoto.location && (
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{activePhoto.location.name}</span>
                </div>
              )}

              {/* Album */}
              {activePhoto.albumName && (
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <Link
                    href={`/albums/${activePhoto.albumId}`}
                    onClick={closeLightbox}
                    className="hover:underline text-amber-300 font-medium"
                  >
                    {activePhoto.albumName}
                  </Link>
                </div>
              )}

              {/* Tagged Family Members */}
              {people.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-sans uppercase tracking-wider text-zinc-400 block">
                    People in this photo
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {people.map((person) => (
                      <Link
                        key={person.id}
                        href={`/people/${person.id}`}
                        onClick={closeLightbox}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-white/10 text-xs text-zinc-200 hover:border-amber-400/40 transition-colors"
                      >
                        <Image
                          src={person.avatarUrl}
                          alt={person.name}
                          width={18}
                          height={18}
                          className="rounded-full object-cover"
                        />
                        <span>{person.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible EXIF Camera Specs */}
            {activePhoto.cameraInfo && (
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowExif(!showExif)}
                  className="w-full flex items-center justify-between text-xs font-sans text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" /> Camera Details
                  </span>
                  {showExif ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showExif && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-1 font-mono text-[11px] text-zinc-400 pl-5 border-l border-amber-400/20"
                  >
                    <p>
                      {activePhoto.cameraInfo.make} {activePhoto.cameraInfo.model}
                    </p>
                    <p>Lens: {activePhoto.cameraInfo.lens || activePhoto.cameraInfo.focalLength}</p>
                    <p>
                      {activePhoto.cameraInfo.aperture} • {activePhoto.cameraInfo.shutterSpeed} • ISO{' '}
                      {activePhoto.cameraInfo.iso}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
