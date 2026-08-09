'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PhotoService } from '@/services/photoService';
import { Photo, GalleryLayoutType } from '@/types';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { LayoutSwitcher } from '@/components/gallery/LayoutSwitcher';

export default function AllPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [layout, setLayout] = useState<GalleryLayoutType>('masonry');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    PhotoService.getPhotos({ searchQuery: searchQuery || undefined }).then(setPhotos);
  }, [searchQuery]);

  const allTags = Array.from(new Set(photos.flatMap((p) => p.tags)));

  const filteredPhotos =
    selectedTag === 'all' ? photos : photos.filter((p) => p.tags.includes(selectedTag));

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">All Memories</h1>
          <p className="text-xs font-mono text-amber-400 mt-1">
            Showing {filteredPhotos.length} curated photographs
          </p>
        </div>

        {/* Dynamic Layout Switcher Toolbar */}
        <LayoutSwitcher currentLayout={layout} onChange={setLayout} />
      </div>

      {/* Search & Tag Filter Pills */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search memories, locations, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              selectedTag === 'all'
                ? 'bg-amber-400 text-zinc-950 font-bold'
                : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Switchable Gallery View */}
      <GalleryRenderer layout={layout} photos={filteredPhotos} />
    </div>
  );
}
