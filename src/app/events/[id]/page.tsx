'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhotoService } from '@/services/photoService';
import { FamilyEvent, Photo, GalleryLayoutType } from '@/types';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { LayoutSwitcher } from '@/components/gallery/LayoutSwitcher';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/Feedback';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<FamilyEvent | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [layout, setLayout] = useState<GalleryLayoutType>('bento');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([PhotoService.getEventById(id), PhotoService.getPhotos({ eventId: id })])
      .then(([evtData, photosData]) => {
        setEvent(evtData);
        setPhotos(photosData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500 font-sans text-xs">
        Loading event gathering...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6 py-12">
        <Link href="/events" className="inline-flex items-center gap-2 text-xs font-sans text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
        </Link>
        <EmptyState title="Event Not Found" description="The requested milestone gathering could not be found." />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <Link href="/events" className="inline-flex items-center gap-2 text-xs font-sans text-zinc-400 hover:text-amber-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
      </Link>

      {/* Event Cover Banner */}
      <div className="relative w-full h-[45vh] min-h-[300px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <Image src={event.coverPhotoUrl} alt={event.title} fill priority sizes="(max-width: 1200px) 100vw, 1400px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent p-8 md:p-12 flex flex-col justify-end">
          <div className="flex items-center gap-3">
            <span className="text-xs font-sans uppercase tracking-widest text-amber-400">
              MILESTONE EVENT • {formatDate(event.date)}
            </span>
            <span className="font-signature text-amber-300 text-lg">celebration</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight mt-1">
            {event.title}
          </h1>
          {event.locationName && (
            <p className="text-xs font-sans text-zinc-300 flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-amber-400" /> {event.locationName}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <span className="text-xs font-sans text-zinc-400 font-medium">
          Showing {photos.length} photographs from this gathering
        </span>
        <LayoutSwitcher currentLayout={layout} onChange={setLayout} />
      </div>

      <GalleryRenderer layout={layout} photos={photos} />
    </div>
  );
}
