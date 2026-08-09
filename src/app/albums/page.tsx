'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhotoService } from '@/services/photoService';
import { Album } from '@/types';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    PhotoService.getAlbums().then(setAlbums);
  }, []);

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        badge="THE COLLECTION"
        title="Stories we've kept. Moments we've lived."
        subtitle="Curated family photo books spanning generations"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {albums.map((album, idx) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
          >
            <Link
              href={`/albums/${album.id}`}
              className="group block relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl"
            >
              <div className="relative h-72 w-full overflow-hidden">
                <Image
                  src={album.coverPhotoUrl}
                  alt={album.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-sans text-amber-400">
                  <span>{album.dateRange}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <FolderOpen className="w-3.5 h-3.5" /> {album.photoCount} photos
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                  {album.title}
                </h2>
                {album.description && (
                  <p className="text-xs font-sans text-zinc-400 font-light leading-relaxed line-clamp-2">
                    {album.description}
                  </p>
                )}
                <div className="pt-2 flex items-center gap-1 text-xs font-sans text-amber-300 group-hover:translate-x-1 transition-transform">
                  <span>Open photo book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
