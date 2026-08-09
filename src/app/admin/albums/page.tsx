'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PhotoService } from '@/services/photoService';
import { Album, Photo, GalleryLayoutType } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GalleryRenderer } from '@/components/gallery/GalleryRenderer';
import { LayoutSwitcher } from '@/components/gallery/LayoutSwitcher';
import { Plus, Edit2, Trash2, X, Check, Eye } from 'lucide-react';
import { EmptyState } from '@/components/ui/Feedback';

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<GalleryLayoutType>('bento');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');

  useEffect(() => {
    Promise.all([PhotoService.getAlbums(), PhotoService.getPhotos()]).then(([a, p]) => {
      setAlbums(a);
      setPhotos(p);
    });
  }, []);

  const handleOpenEdit = (album: Album) => {
    setEditingAlbum(album);
    setTitle(album.title);
    setDescription(album.description || '');
    setDateRange(album.dateRange || '');
    setSelectedLayout(album.defaultLayout || 'bento');
    setCoverPhotoUrl(album.coverPhotoUrl);
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingAlbum(null);
    setTitle('');
    setDescription('');
    setDateRange('2026');
    setSelectedLayout('bento');
    setCoverPhotoUrl(photos[0]?.url || '');
    setIsCreating(true);
  };

  const handleSaveAlbum = () => {
    if (isCreating) {
      const newAlbum: Album = {
        id: `alb-${Date.now()}`,
        title,
        description,
        coverPhotoUrl: coverPhotoUrl || photos[0]?.url || '',
        photoCount: 12,
        dateRange,
        defaultLayout: selectedLayout,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAlbums((prev) => [newAlbum, ...prev]);
    } else if (editingAlbum) {
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === editingAlbum.id
            ? { ...a, title, description, dateRange, defaultLayout: selectedLayout, coverPhotoUrl }
            : a
        )
      );
    }
    setIsCreating(false);
    setEditingAlbum(null);
  };

  const handleDeleteAlbum = (id: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        badge="COLLECTIONS MANAGER"
        title="Albums & Layout Configurations"
        subtitle="Manage story photo books and configure custom gallery layout styles"
        action={
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Create New Album
          </Button>
        }
      />

      {/* Album List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-5 space-y-4 font-sans text-xs"
          >
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10">
              <Image src={album.coverPhotoUrl} alt={album.title} fill className="object-cover" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-amber-400 font-mono text-[11px]">
                <span>{album.dateRange}</span>
                <span className="uppercase">{album.defaultLayout || 'bento'}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">{album.title}</h3>
              {album.description && <p className="text-zinc-400 line-clamp-2">{album.description}</p>}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-zinc-500 font-mono text-[11px]">{album.photoCount} photos</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(album)}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Edit Album"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteAlbum(album.id)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Delete Album"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Album Dialog */}
      {(isCreating || editingAlbum) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-3xl bg-zinc-900 border border-white/10 space-y-6 text-zinc-100 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-2xl font-serif font-bold text-white">
                {isCreating ? 'Create New Album' : `Edit Album: ${editingAlbum?.title}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingAlbum(null);
                }}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Album Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="Date Range" value={dateRange} onChange={(e) => setDateRange(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Album Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            {/* Gallery Presentation Selector */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-amber-400">
                Configure Gallery Style Presentation
              </label>
              <LayoutSwitcher currentLayout={selectedLayout} onChange={setSelectedLayout} />
            </div>

            {/* Live Gallery Engine Preview */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                Live Gallery Engine Preview ({selectedLayout})
              </span>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 max-h-72 overflow-y-auto">
                <GalleryRenderer layout={selectedLayout} photos={photos.slice(0, 4)} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsCreating(false);
                  setEditingAlbum(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" icon={<Check className="w-4 h-4" />} onClick={handleSaveAlbum}>
                Save Album Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
