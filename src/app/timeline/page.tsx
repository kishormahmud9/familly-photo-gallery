'use client';

import { useEffect, useState } from 'react';
import { PhotoService } from '@/services/photoService';
import { Photo, GalleryLayoutType } from '@/types';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { LayoutSwitcher } from '@/components/gallery/LayoutSwitcher';
import { PageHeader } from '@/components/ui/PageHeader';

export default function TimelinePage() {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [layout, setLayout] = useState<GalleryLayoutType>('timeline');

  useEffect(() => {
    PhotoService.getAvailableYears().then((yearList) => {
      setYears(yearList);
      if (yearList.length > 0) {
        setSelectedYear(yearList[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedYear) {
      PhotoService.getPhotos({ year: selectedYear }).then(setPhotos);
    }
  }, [selectedYear]);

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        badge="CHRONOLOGY"
        title="Travel through decades of family milestones."
        subtitle="Explore archived memories organized by year and era"
      />

      {/* Touch-Friendly Horizontal Year Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-6 py-2.5 rounded-2xl font-sans text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedYear === year
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/10 scale-105'
                : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Responsive Layout Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <span className="text-xs font-sans text-zinc-400 font-medium">
          Showing {photos.length} memories from {selectedYear}
        </span>
        <LayoutSwitcher currentLayout={layout} onChange={setLayout} />
      </div>

      {/* Gallery Engine Render */}
      <GalleryRenderer layout={layout} photos={photos} />
    </div>
  );
}
