'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhotoService } from '@/services/photoService';
import { Person, Photo, GalleryLayoutType } from '@/types';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { LayoutSwitcher } from '@/components/gallery/LayoutSwitcher';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/ui/Feedback';

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [person, setPerson] = useState<Person | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [layout, setLayout] = useState<GalleryLayoutType>('masonry');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([PhotoService.getPersonById(id), PhotoService.getPhotos({ personId: id })])
      .then(([personData, photosData]) => {
        setPerson(personData);
        setPhotos(photosData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500 font-sans text-xs">
        Loading portrait archive...
      </div>
    );
  }

  if (!person) {
    return (
      <div className="space-y-6 py-12">
        <Link href="/people" className="inline-flex items-center gap-2 text-xs font-sans text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Family Directory
        </Link>
        <EmptyState title="Person Profile Not Found" description="The requested family member profile could not be located." />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <Link href="/people" className="inline-flex items-center gap-2 text-xs font-sans text-zinc-400 hover:text-amber-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Family Directory
      </Link>

      {/* Person Biography Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-white/10 pb-10">
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-2xl shrink-0">
          <Image src={person.avatarUrl} alt={person.name} fill className="object-cover" priority />
        </div>

        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span className="text-xs font-sans uppercase tracking-widest text-amber-400">
              {person.role} • Born {person.birthYear}
            </span>
            <span className="font-signature text-amber-300 text-lg">biography</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            {person.name}
          </h1>
          {person.bio && (
            <p className="text-zinc-300 max-w-2xl font-sans font-light text-sm md:text-base leading-relaxed">
              {person.bio}
            </p>
          )}
        </div>
      </div>

      {/* Toolbar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <span className="text-xs font-sans text-zinc-400 font-medium">
          Showing {photos.length} tagged photographs featuring {person.name.split(' ')[0]}
        </span>
        <LayoutSwitcher currentLayout={layout} onChange={setLayout} />
      </div>

      {/* Associated Photos Gallery */}
      <GalleryRenderer layout={layout} photos={photos} />
    </div>
  );
}
