'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FolderOpen, Users, Calendar, Heart, Clock, Sparkles } from 'lucide-react';
import { PhotoService } from '@/services/photoService';
import { Photo, Album, Person } from '@/types';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { Button } from '@/components/ui/Button';
import heroBg from '/hero/hero-bg.jpg';

export default function HomePage() {
  const [featuredPhotos, setFeaturedPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      PhotoService.getFeaturedPhotos(),
      PhotoService.getAlbums(),
      PhotoService.getPeople(),
      PhotoService.getAvailableYears(),
    ]).then(([photosData, albumsData, peopleData, yearsData]) => {
      setFeaturedPhotos(photosData);
      setAlbums(albumsData);
      setPeople(peopleData);
      setYears(yearsData);
    });
  }, []);

  return (
    <div className="space-y-24 pb-12">
      {/* 1. Cinematic Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[550px] max-h-[800px] rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
        <Image
          src="/hero/hero-bg.jpg"
          alt="Family Archive Hero"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1400px"
          className="object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-8 md:p-14">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  THE FAMILY ARCHIVE
                </span>
                <span className="font-signature text-amber-300 text-lg">captured with love</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
                Moments we remember.
              </h1>
              <p className="text-zinc-300 text-sm md:text-base font-sans font-light leading-relaxed max-w-xl">
                {'A timeless collection of family stories, milestones, and memories spanning generations.'}
              </p>

              {/* Hero Archival Metadata */}
              <div className="flex items-center gap-4 text-xs font-sans text-zinc-400 pt-1">
                <span>Bangladesh</span>
                <span>•</span>
                <span>2024</span>
                <span>•</span>
                <span>{featuredPhotos.length} curated highlights</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link href="/photos">
                  <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore Memories
                  </Button>
                </Link>
                <Link href="/albums">
                  <Button variant="outline" size="lg">
                    View Albums
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>


      {/* 2. Editorial Quote Statement */}
      <section className="text-center max-w-3xl mx-auto space-y-3 py-6">
        <span className="font-signature text-amber-400 text-2xl block">a quiet reflection</span>
        <blockquote className="text-2xl md:text-3xl font-serif text-zinc-200 leading-snug">
          "Some moments become memories before we even realize it."
        </blockquote>
        <p className="text-xs font-sans text-zinc-500 uppercase tracking-widest pt-2">
          Preserved for generations
        </p>
      </section>

      {/* 3. Featured Curated Gallery (Bento Layout) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-sans uppercase tracking-widest text-amber-400 block mb-1">
              Curated Highlights
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Recent Memories</h2>
          </div>
          <Link
            href="/photos"
            className="text-xs font-sans text-zinc-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            View all memories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <GalleryRenderer layout="bento" photos={featuredPhotos} />
      </section>

      {/* 4. Family Albums Showcase */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-sans uppercase tracking-widest text-amber-400">
                Collections
              </span>
              <span className="font-signature text-amber-300/80 text-base">photo books</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Our Albums</h2>
          </div>
          <Link
            href="/albums"
            className="text-xs font-sans text-zinc-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            All albums <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {albums.slice(0, 3).map((album, idx) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Link
                href={`/albums/${album.id}`}
                className="group block relative h-84 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl"
              >
                <Image
                  src={album.coverPhotoUrl}
                  alt={album.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent p-6 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-xs font-sans text-amber-400">
                    <span>{album.dateRange}</span>
                    <span>{album.photoCount} photos</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors mt-1">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="text-xs text-zinc-400 font-sans line-clamp-2 mt-1 font-light">
                      {album.description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Family / People Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-sans uppercase tracking-widest text-amber-400">
                The Family
              </span>
              <span className="font-signature text-amber-300/80 text-base">the people we love</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Behind the Memories</h2>
          </div>
          <Link
            href="/people"
            className="text-xs font-sans text-zinc-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            Meet the family <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/people/${person.id}`}
              className="group p-4 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-amber-400/30 transition-all text-center flex flex-col items-center gap-3"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-amber-400 transition-colors">
                <Image src={person.avatarUrl} alt={person.name} fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-sans font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {person.name}
                </h4>
                <p className="text-[11px] font-sans text-amber-400/80 mt-0.5">{person.role}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Timeline Teaser */}
      <section className="p-8 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-sans uppercase tracking-widest text-amber-400 block mb-1">
              Through the Years
            </span>
            <h2 className="text-2xl font-serif font-bold text-white">Chronological Journey</h2>
          </div>
          <Link href="/timeline">
            <Button variant="secondary" size="sm" icon={<Clock className="w-3.5 h-3.5" />}>
              Open Timeline
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {years.slice(0, 4).map((year) => (
            <Link
              key={year}
              href="/timeline"
              className="p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-amber-400/30 transition-all text-center group"
            >
              <span className="text-3xl font-serif font-bold text-amber-400 group-hover:scale-105 block transition-transform">
                {year}
              </span>
              <span className="text-[11px] font-sans text-zinc-400 mt-1 block">Explore photos</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Understated Final Call-to-Action */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 p-12 md:p-16 text-center space-y-4">
        <span className="font-signature text-amber-400 text-2xl block">every photograph holds a story</span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white max-w-xl mx-auto leading-tight">
          Explore the full family archive.
        </h2>
        <div className="pt-4 flex justify-center">
          <Link href="/photos">
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Browse All Memories
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
