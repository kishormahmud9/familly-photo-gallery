'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhotoService } from '@/services/photoService';
import { Person } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { ArrowRight } from 'lucide-react';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    PhotoService.getPeople().then(setPeople);
  }, []);

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        badge="THE PEOPLE"
        title="The faces behind the memories."
        subtitle="Explore family history through individual portrait archives"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person, idx) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
          >
            <Link
              href={`/people/${person.id}`}
              className="group flex items-center gap-5 p-6 rounded-3xl bg-zinc-900/60 border border-white/10 hover:border-amber-400/40 transition-all shadow-lg"
            >
              <div className="relative w-22 h-22 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-amber-400 transition-colors shrink-0 shadow-md">
                <Image src={person.avatarUrl} alt={person.name} fill className="object-cover" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-amber-400 font-medium">
                    {person.role}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                  {person.name}
                </h2>
                {person.bio && (
                  <p className="text-xs font-sans text-zinc-400 line-clamp-2 font-light leading-relaxed">
                    {person.bio}
                  </p>
                )}
                <div className="pt-1 flex items-center gap-1 text-[11px] font-sans text-amber-300 group-hover:translate-x-1 transition-transform">
                  <span>View biography</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
