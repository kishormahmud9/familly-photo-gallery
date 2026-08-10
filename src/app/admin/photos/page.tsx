'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhotoService } from '@/services/photoService';
import { Photo } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { MediaToolbar } from '@/components/admin/media/MediaToolbar';
import { MediaSelectionToolbar } from '@/components/admin/media/MediaSelectionToolbar';
import { MediaDetailDrawer } from '@/components/admin/media/MediaDetailDrawer';
import { useLightbox } from '@/context/LightboxContext';
import { Upload, Check, Eye, Info, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [inspectPhoto, setInspectPhoto] = useState<Photo | null>(null);

  const { openLightbox } = useLightbox();

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const data = await PhotoService.getAdminPhotos({ searchQuery: searchQuery || undefined, sortBy });
      setPhotos(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [searchQuery, sortBy]);

  const allTags = Array.from(new Set(photos.flatMap((p) => p.tags)));
  const filteredPhotos = selectedTag === 'all' ? photos : photos.filter((p) => p.tags.includes(selectedTag));

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedPhotoIds.length === filteredPhotos.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(filteredPhotos.map((p) => p.id));
    }
  };

  // Real API Delete handler
  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo? This will permanently delete the image from Cloudinary and database.')) return;

    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        alert(body.message || 'Failed to delete photo.');
        return;
      }

      setSelectedPhotoIds((prev) => prev.filter((item) => item !== id));
      await fetchPhotos();
    } catch {
      alert('Network error while deleting photo.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotoIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedPhotoIds.length} selected photos permanently?`)) return;

    try {
      const res = await fetch('/api/photos/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPhotoIds }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        alert(body.message || 'Bulk delete failed.');
        return;
      }

      setSelectedPhotoIds([]);
      await fetchPhotos();
    } catch {
      alert('Network error during bulk delete.');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <PageHeader
        badge="MEDIA ARCHIVE MANAGER"
        title="Photos & Metadata"
        subtitle={`Browse and manage ${photos.length} archived family photographs`}
        action={
          <Link href="/admin/upload">
            <Button variant="primary" size="md" icon={<Upload className="w-4 h-4" />}>
              Upload Photos
            </Button>
          </Link>
        }
      />

      {/* Search & Tag Filter Pills */}
      <div className="space-y-4">
        <SearchInput
          placeholder="Search titles, descriptions, or filenames..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />

        {/* Filter Pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-sans whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-amber-400 text-zinc-950 font-bold'
                    : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Media Toolbar Controls */}
      <MediaToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedCount={selectedPhotoIds.length}
        totalCount={filteredPhotos.length}
        allSelected={selectedPhotoIds.length > 0 && selectedPhotoIds.length === filteredPhotos.length}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenFiltersMobile={() => {}}
      />

      {/* Media Selection Floating Action Bar */}
      {selectedPhotoIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
          <span className="text-xs font-mono text-amber-300">
            {selectedPhotoIds.length} photo(s) selected
          </span>
          <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleBulkDelete}>
            Delete Selected
          </Button>
        </div>
      )}

      {/* Loading / Empty / Content */}
      {isLoading ? (
        <div className="py-20 text-center text-zinc-500 font-sans text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          Loading photo archive from database...
        </div>
      ) : filteredPhotos.length === 0 ? (
        <EmptyState
          title="No Photographs Found"
          description="Your database currently has no uploaded family photographs."
          action={
            <Link href="/admin/upload">
              <Button variant="primary" size="sm" icon={<Upload className="w-4 h-4" />}>
                Upload First Photo
              </Button>
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((photo) => {
            const isSelected = selectedPhotoIds.includes(photo.id);
            return (
              <div
                key={photo.id}
                className={`relative group rounded-2xl overflow-hidden bg-zinc-900 border transition-all ${
                  isSelected ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Selection Checkbox overlay */}
                <button
                  onClick={() => handleToggleSelect(photo.id)}
                  className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-400 border-amber-400 text-zinc-950' : 'bg-black/40 border-white/30 text-transparent hover:border-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {/* Thumbnail */}
                <div className="relative aspect-square w-full">
                  <Image src={photo.thumbnailUrl} alt={photo.title} fill className="object-cover" />

                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => openLightbox(photo, filteredPhotos)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Preview Photo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setInspectPhoto(photo)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Inspect Metadata"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors cursor-pointer"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="p-3">
                  <h4 className="text-xs font-sans font-semibold text-white truncate">{photo.title}</h4>
                  <span className="text-[10px] font-mono text-zinc-400">{formatDate(photo.date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden divide-y divide-white/5 font-sans text-xs">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <Image src={photo.thumbnailUrl} alt={photo.title} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{photo.title}</h4>
                  <span className="text-[11px] font-mono text-zinc-400">{formatDate(photo.date)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openLightbox(photo, filteredPhotos)}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Detail Drawer */}
      {inspectPhoto && (
        <MediaDetailDrawer photo={inspectPhoto} onClose={() => setInspectPhoto(null)} />
      )}
    </div>
  );
}
