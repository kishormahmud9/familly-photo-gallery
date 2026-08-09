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
import { Upload, Heart, Check, Eye, Info, Trash2, Calendar, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [inspectPhoto, setInspectPhoto] = useState<Photo | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { openLightbox } = useLightbox();

  useEffect(() => {
    PhotoService.getPhotos({ searchQuery: searchQuery || undefined, sortBy }).then(setPhotos);
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

  // Simulated local delete handler
  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setSelectedPhotoIds((prev) => prev.filter((item) => item !== id));
    setDeleteConfirmId(null);
  };

  const handleBulkFavorite = () => {
    setPhotos((prev) =>
      prev.map((p) => (selectedPhotoIds.includes(p.id) ? { ...p, favorite: true } : p))
    );
  };

  const handleBulkDelete = () => {
    setPhotos((prev) => prev.filter((p) => !selectedPhotoIds.includes(p.id)));
    setSelectedPhotoIds([]);
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
          placeholder="Search titles, descriptions, locations, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />

        {/* Filter Pills */}
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

      {/* Empty State Check */}
      {filteredPhotos.length === 0 ? (
        <EmptyState
          title="No photographs match your query"
          description="Try adjusting your search criteria or tag filters to locate photos."
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
                      onClick={() => setDeleteConfirmId(photo.id)}
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
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden divide-y divide-white/5 text-xs font-sans">
          {filteredPhotos.map((photo) => {
            const isSelected = selectedPhotoIds.includes(photo.id);
            return (
              <div
                key={photo.id}
                className={`p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors ${
                  isSelected ? 'bg-amber-400/5' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={() => handleToggleSelect(photo.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'bg-amber-400 border-amber-400 text-zinc-950' : 'border-white/30 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>

                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    <Image src={photo.thumbnailUrl} alt={photo.title} fill className="object-cover" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{photo.title}</h4>
                    <p className="text-zinc-400 font-mono text-[11px]">{photo.albumName || 'Unassigned Album'}</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-zinc-400 text-xs font-mono">
                  <span>{formatDate(photo.date)}</span>
                  {photo.location && <span>{photo.location.name}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openLightbox(photo, filteredPhotos)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setInspectPhoto(photo)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                    title="Metadata"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(photo.id)}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contextual Bulk Action Toolbar */}
      <MediaSelectionToolbar
        selectedCount={selectedPhotoIds.length}
        onClearSelection={() => setSelectedPhotoIds([])}
        onBulkFavorite={handleBulkFavorite}
        onBulkDelete={handleBulkDelete}
      />

      {/* Metadata Inspection Drawer */}
      <MediaDetailDrawer photo={inspectPhoto} onClose={() => setInspectPhoto(null)} />

      {/* Simulated Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 text-center">
            <h3 className="text-lg font-serif font-bold text-white">Delete Photograph?</h3>
            <p className="text-xs font-sans text-zinc-400">
              This photo will be removed from the local mock archive collection.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDeletePhoto(deleteConfirmId)}>
                Delete Photo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
