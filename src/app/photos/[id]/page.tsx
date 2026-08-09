'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, FolderOpen, Heart, Camera } from 'lucide-react';
import { PhotoService } from '@/services/photoService';
import { Photo, Person } from '@/types';
import { formatDate } from '@/lib/utils';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { Button } from '@/components/ui/Button';

export default function PhotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [relatedPhotos, setRelatedPhotos] = useState<Photo[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    PhotoService.getPhotoById(id).then((p) => {
      setPhoto(p);
      if (p) {
        setIsFavorited(p.favorite);
        // Load associated people
        if (p.peopleIds && p.peopleIds.length > 0) {
          Promise.all(p.peopleIds.map((pid) => PhotoService.getPersonById(pid))).then((res) =>
            setPeople(res.filter(Boolean) as Person[])
          );
        }
        // Load related photos from same album or tag
        PhotoService.getPhotos({ albumId: p.albumId }).then((photos) =>
          setRelatedPhotos(photos.filter((rp) => rp.id !== p.id))
        );
      }
    });
  }, [id]);

  if (!photo) {
    return (
      <div className="py-24 text-center text-zinc-500 font-mono text-sm">
        Loading photograph...
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-12">
      {/* Back Button */}
      <Link href="/photos" className="inline-flex items-center gap-2 text-xs font-sans text-zinc-400 hover:text-amber-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to All Photos
      </Link>

      {/* Main Large Visual Image Presentation */}
      <div className="relative w-full h-[70vh] min-h-[450px] max-h-[750px] rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
        <Image
          src={photo.url}
          alt={photo.title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1400px"
          className="object-contain p-4 md:p-8"
        />
      </div>

      {/* Primary Photo Information & Context */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-sans uppercase tracking-widest text-amber-400">
                {formatDate(photo.date)}
              </span>
              <span className="font-signature text-amber-300 text-lg">captured moment</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              {photo.title}
            </h1>
            {photo.description && (
              <p className="text-base font-sans font-light text-zinc-300 leading-relaxed max-w-2xl pt-2">
                {photo.description}
              </p>
            )}
          </div>

          <Button
            variant={isFavorited ? 'secondary' : 'outline'}
            size="md"
            icon={<Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />}
            onClick={() => setIsFavorited(!isFavorited)}
          >
            {isFavorited ? 'Saved to Favorites' : 'Save Memory'}
          </Button>
        </div>

        {/* Structured Contextual Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-sans text-xs">
          {/* People */}
          {people.length > 0 && (
            <div className="space-y-2 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
              <span className="text-[11px] font-sans uppercase tracking-wider text-amber-400 block">
                People
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {people.map((person) => (
                  <Link
                    key={person.id}
                    href={`/people/${person.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-white/10 text-zinc-200 hover:border-amber-400/40 transition-colors"
                  >
                    <Image src={person.avatarUrl} alt={person.name} width={18} height={18} className="rounded-full object-cover" />
                    <span>{person.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Location & Album */}
          <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <span className="text-[11px] font-sans uppercase tracking-wider text-amber-400 block">
              Context
            </span>
            {photo.location && (
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{photo.location.name}</span>
              </div>
            )}
            {photo.albumName && (
              <div className="flex items-center gap-2 text-zinc-300">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <Link href={`/albums/${photo.albumId}`} className="hover:underline text-amber-300 font-medium">
                  {photo.albumName}
                </Link>
              </div>
            )}
          </div>

          {/* Camera Info */}
          {photo.cameraInfo && (
            <div className="space-y-2 p-5 rounded-2xl bg-zinc-900/60 border border-white/10 font-mono text-[11px] text-zinc-400">
              <span className="text-[11px] font-sans uppercase tracking-wider text-amber-400 block font-normal">
                Camera Specs
              </span>
              <p className="text-zinc-200">{photo.cameraInfo.make} {photo.cameraInfo.model}</p>
              <p>{photo.cameraInfo.lens || photo.cameraInfo.focalLength}</p>
              <p>{photo.cameraInfo.aperture} • {photo.cameraInfo.shutterSpeed} • ISO {photo.cameraInfo.iso}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Photos */}
      {relatedPhotos.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-white/10">
          <div>
            <span className="text-[11px] font-sans uppercase tracking-widest text-amber-400 block mb-1">
              From the same album
            </span>
            <h2 className="text-2xl font-serif font-bold text-white">Related Memories</h2>
          </div>
          <GalleryRenderer layout="grid" photos={relatedPhotos} />
        </div>
      )}
    </div>
  );
}
