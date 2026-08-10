'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhotoService } from '@/services/photoService';
import { Photo, Album, Person } from '@/types';
import { Image as ImageIcon, FolderOpen, Users, Upload, HardDrive, ArrowUpRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminOverviewPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [realStats, setRealStats] = useState<{ totalAlbums: number; totalPhotos: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard', { cache: 'no-store' })
      .then((res) => res.json())
      .then((body) => {
        if (body.success && body.data?.stats) {
          setRealStats(body.data.stats);
        }
      })
      .catch(() => {});

    Promise.all([
      PhotoService.getPhotos(),
      PhotoService.getAlbums(),
      PhotoService.getPeople(),
    ]).then(([p, a, pe]) => {
      setPhotos(p);
      setAlbums(a);
      setPeople(pe);
    });
  }, []);

  const stats = [
    { label: 'Total Photographs', value: realStats ? realStats.totalPhotos : photos.length, icon: <ImageIcon className="w-5 h-5 text-amber-400" /> },
    { label: 'Albums', value: realStats ? realStats.totalAlbums : albums.length, icon: <FolderOpen className="w-5 h-5 text-amber-400" /> },
    { label: 'Family Members', value: people.length, icon: <Users className="w-5 h-5 text-amber-400" /> },
    { label: 'Cloud Storage', value: 'Cloudinary Active', icon: <HardDrive className="w-5 h-5 text-amber-400" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Dashboard Overview</h1>
          <p className="text-xs font-mono text-amber-400 mt-1">Manage family archives and upload queues</p>
        </div>

        <Link
          href="/admin/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs font-mono transition-all shadow-lg shadow-amber-500/10"
        >
          <Upload className="w-4 h-4" /> Upload New Photos
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2 flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-mono text-zinc-400">{stat.label}</span>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">{stat.value}</h3>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800 border border-white/10">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Recent Uploads Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-white">Recent Uploads</h2>
          <Link
            href="/admin/photos"
            className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
          >
            Manage all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden">
          <div className="divide-y divide-white/5">
            {photos.slice(0, 4).map((photo) => (
              <div key={photo.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <Image src={photo.thumbnailUrl} alt={photo.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{photo.title}</h4>
                    <p className="text-xs text-zinc-400 font-mono">{photo.albumName || 'Unassigned Album'}</p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-zinc-400">
                  <p>{formatDate(photo.date)}</p>
                  <span className="text-[10px] text-amber-400">{photo.orientation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
