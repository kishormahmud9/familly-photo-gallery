'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhotoService } from '@/services/photoService';
import { Album, Photo, GalleryLayoutType } from '@/types';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { LayoutSwitcher } from '@/components/gallery/LayoutSwitcher';
import { ArrowLeft, FolderOpen, Calendar } from 'lucide-react';
import { EmptyState } from '@/components/ui/Feedback';

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [layout, setLayout] = useState<GalleryLayoutType>('editorial');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([PhotoService.getAlbumById(id), PhotoService.getPhotos({ albumId: id })])
      .then(([albumData, photosData]) => {
        setAlbum(albumData);
        setPhotos(photosData);
        if (albumData?.defaultLayout) {
          setLayout(albumData.defaultLayout);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500 font-sans text-xs">
        Loading album chapter...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="space-y-6 py-12">
        <Link href="/albums" className="inline-flex items-center gap-2 text-xs font-sans text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Albums
        </Link>
        <EmptyState title="Album Not Found" description="The requested album collection does not exist or has been relocated." />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Back Button */}
      <Link href="/albums" className="inline-flex items-center gap-2 text-xs font-sans text-zinc-400 hover:text-amber-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Albums
      </Link>

      {/* Album Cover Hero Banner */}
      <div className="relative w-full h-[45vh] min-h-[300px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <Image
          src={album.coverPhotoUrl}
          alt={album.title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1400px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent p-8 md:p-12 flex flex-col justify-end">
          <div className="flex items-center gap-3">
            <span className="text-xs font-sans uppercase tracking-widest text-amber-400">
              ALBUM COLLECTION • {album.dateRange}
            </span>
            <span className="font-signature text-amber-300 text-lg">chapter</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight mt-1">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-zinc-300 max-w-2xl font-sans font-light text-sm md:text-base leading-relaxed mt-2">
              {album.description}
            </p>
          )}
        </div>
      </div>

      {/* Layout Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <span className="text-xs font-sans text-zinc-400 font-medium">
          Showing {photos.length} photographs in this album
        </span>
        <LayoutSwitcher currentLayout={layout} onChange={setLayout} />
      </div>

      {/* Gallery Engine Render */}
      <GalleryRenderer layout={layout} photos={photos} />
    </div>
  );
}
