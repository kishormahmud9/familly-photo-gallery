'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Compass, FolderOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 space-y-8">
      {/* Visual Photo Aperture Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl group"
      >
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
          alt="Lost Memory"
          fill
          priority
          sizes="320px"
          className="object-cover opacity-40 filter grayscale group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-700"
        />

        {/* Vintage Frame Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
            <span>FRAME #404</span>
            <span className="font-signature text-amber-300 text-lg">unmapped memory</span>
          </div>

          <div className="space-y-1">
            <span className="font-serif text-5xl md:text-6xl font-bold text-amber-400 block tracking-tight">
              404
            </span>
            <span className="text-[11px] font-sans text-zinc-300 uppercase tracking-widest block">
              Out of Focus
            </span>
          </div>
        </div>
      </motion.div>

      {/* Narrative Message */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-md space-y-3"
      >
        <span className="font-signature text-amber-300 text-2xl block">this page lost in time</span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
          Memory Not Found
        </h1>
        <p className="text-xs md:text-sm font-sans font-light text-zinc-400 leading-relaxed">
          The snapshot or page you are looking for has been moved, renamed, or remains unarchived in our family story.
        </p>
      </motion.div>

      {/* Discovery Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="flex flex-wrap items-center justify-center gap-3 pt-2"
      >
        <Link href="/">
          <Button variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link href="/photos">
          <Button variant="secondary" size="md" icon={<Camera className="w-4 h-4 text-amber-400" />}>
            Explore All Photos
          </Button>
        </Link>
        <Link href="/albums">
          <Button variant="outline" size="md" icon={<FolderOpen className="w-4 h-4 text-amber-400" />}>
            Browse Albums
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
