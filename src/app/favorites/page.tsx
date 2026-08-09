'use client';

import { useEffect, useState } from 'react';
import { PhotoService } from '@/services/photoService';
import { Photo, GalleryLayoutType } from '@/types';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { LayoutSwitcher } from '@/components/gallery/LayoutSwitcher';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [layout, setLayout] = useState<GalleryLayoutType>('bento');

  useEffect(() => {
    PhotoService.getFavoritePhotos().then(setPhotos);
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> Saved Favorites
          </h1>
          <p className="text-xs font-mono text-amber-400 mt-1">
            {photos.length} treasured moments saved by the family
          </p>
        </div>

        <LayoutSwitcher currentLayout={layout} onChange={setLayout} />
      </div>

      <GalleryRenderer layout={layout} photos={photos} />
    </div>
  );
}
