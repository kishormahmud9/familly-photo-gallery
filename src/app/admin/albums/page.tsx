'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PhotoService } from '@/services/photoService';
import { Album, Photo } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploadPicker, UploadResult } from '@/components/ui/ImageUploadPicker';
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/Feedback';

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Cloudinary-resolved image data (set by ImageUploadPicker on success)
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPublicId, setCoverPublicId] = useState<string | null>(null);

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const albums = await PhotoService.getAdminAlbums();
      setAlbums(albums);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCoverUrl(null);
    setCoverPublicId(null);
    setErrorMessage(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingAlbum(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (album: Album) => {
    setEditingAlbum(album);
    setTitle(album.title);
    setDescription(album.description || '');
    // Populate existing cover from DB record
    setCoverUrl(album.coverPhotoUrl || null);
    setCoverPublicId((album as any).cloudinaryPublicId || null);
    setErrorMessage(null);
    setIsCreating(false);
  };

  const handleCoverUploaded = (result: UploadResult) => {
    setCoverUrl(result.secureUrl);
    setCoverPublicId(result.publicId);
  };

  const handleCoverRemoved = () => {
    setCoverUrl(null);
    setCoverPublicId(null);
  };

  const handleSaveAlbum = async () => {
    if (!title.trim()) {
      setErrorMessage('Album title is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        coverUrl: coverUrl || null,
        cloudinaryPublicId: coverPublicId || null,
      };

      if (isCreating) {
        const res = await fetch('/api/albums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.message || 'Failed to create album');
        }
      } else if (editingAlbum) {
        const res = await fetch(`/api/albums/${editingAlbum.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.message || 'Failed to update album');
        }
      }

      setIsCreating(false);
      setEditingAlbum(null);
      resetForm();
      await fetchAlbums();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while saving the album.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return;

    try {
      const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' });
      const body = await res.json();

      if (!res.ok || !body.success) {
        alert(body.message || 'Failed to delete album.');
        return;
      }

      await fetchAlbums();
    } catch {
      alert('Network error while deleting album.');
    }
  };

  const modalOpen = isCreating || Boolean(editingAlbum);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        badge="COLLECTIONS MANAGER"
        title="Albums & Layout Configurations"
        subtitle="Manage story photo books stored in Neon PostgreSQL"
        action={
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Create New Album
          </Button>
        }
      />

      {/* Album List / Loading / Empty State */}
      {isLoading ? (
        <div className="py-20 text-center text-zinc-500 font-sans text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          Loading albums from database...
        </div>
      ) : albums.length === 0 ? (
        <EmptyState
          title="No Albums Found"
          description="Your database currently has no photo albums. Create one to begin organizing photos."
          action={
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
              Create First Album
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-5 space-y-4 font-sans text-xs shadow-xl"
            >
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10">
                {album.coverPhotoUrl ? (
                  <Image src={album.coverPhotoUrl} alt={album.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <span className="font-mono text-[11px] uppercase tracking-wider">No Cover</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-mono text-[11px]">
                  <span>Created {album.dateRange}</span>
                  <span className="uppercase">bento</span>
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
      )}

      {/* Create / Edit Album Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-3xl bg-zinc-900 border border-white/10 space-y-6 text-zinc-100 font-sans text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-2xl font-serif font-bold text-white">
                {isCreating ? 'Create New Album' : `Edit Album: ${editingAlbum?.title}`}
              </h3>
              <button
                onClick={() => { setIsCreating(false); setEditingAlbum(null); resetForm(); }}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-5">
              <Input
                label="Album Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Vacation 2026"
              />

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Album Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief summary of this album collection..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                />
              </div>

              {/* Cover image upload — replaces URL input */}
              <ImageUploadPicker
                label="Cover Image (Optional)"
                folderType="covers"
                shape="rect"
                currentImageUrl={coverUrl}
                onUploadSuccess={handleCoverUploaded}
                onRemove={handleCoverRemoved}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="md"
                disabled={isSaving}
                onClick={() => { setIsCreating(false); setEditingAlbum(null); resetForm(); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={isSaving}
                icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                onClick={handleSaveAlbum}
              >
                {isSaving ? 'Saving...' : 'Save Album'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
