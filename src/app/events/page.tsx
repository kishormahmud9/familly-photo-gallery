'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhotoService } from '@/services/photoService';
import { FamilyEvent } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function EventsPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);

  useEffect(() => {
    PhotoService.getEvents().then(setEvents);
  }, []);

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        badge="MILESTONES"
        title="Celebrations & Key Gatherings."
        subtitle="Special family occasions, anniversaries, and reunions"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((evt, idx) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
          >
            <Link
              href={`/events/${evt.id}`}
              className="group block relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={evt.coverPhotoUrl}
                  alt={evt.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-sans text-amber-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(evt.date)}
                  </span>
                  <span>{evt.photoCount} photos</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                  {evt.title}
                </h2>
                {evt.locationName && (
                  <p className="text-xs font-sans text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> {evt.locationName}
                  </p>
                )}
                {evt.description && (
                  <p className="text-xs font-sans text-zinc-400 font-light leading-relaxed line-clamp-2 pt-1">
                    {evt.description}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
