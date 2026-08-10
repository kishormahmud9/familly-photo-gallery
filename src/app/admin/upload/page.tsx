'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Upload, X, Check, ArrowRight, RefreshCw, AlertCircle, Users, UserCircle
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  previewUrl: string;
  status: 'waiting' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  uploadedPhotoId?: string;
}

interface AlbumOption {
  id: string;
  title: string;
}

interface PersonOption {
  id: string;
  name: string;
  role?: string | null;
  avatarUrl?: string | null;
}

export function UploadCenterPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [albums, setAlbums] = useState<AlbumOption[]>([]);
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [selectedPersonIds, setSelectedPersonIds] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/albums', { cache: 'no-store' })
      .then((r) => r.json())
      .then((body) => {
        if (body.success && Array.isArray(body.data)) {
          setAlbums(body.data);
          if (body.data.length > 0) setSelectedAlbumId(body.data[0].id);
        }
      })
      .catch(() => setGlobalError('Failed to fetch albums'));

    fetch('/api/people', { cache: 'no-store' })
      .then((r) => r.json())
      .then((body) => {
        if (body.success && Array.isArray(body.data)) {
          setPeople(body.data);
        }
      })
      .catch(() => {}); // People is optional — don't block upload
  }, []);

  const togglePerson = (id: string) => {
    setSelectedPersonIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const processFiles = (files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const newItems: QueuedFile[] = [];

    Array.from(files).forEach((file, idx) => {
      const typeOk = validTypes.includes(file.type.toLowerCase()) || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
      const sizeOk = file.size <= 10 * 1024 * 1024;
      const preview = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      newItems.push({
        id: `upload-${Date.now()}-${idx}-${Math.random()}`,
        file,
        name: file.name,
        size: sizeMb,
        previewUrl: preview,
        status: !typeOk ? 'error' : !sizeOk ? 'error' : 'waiting',
        errorMessage: !typeOk ? 'Unsupported format (use JPG, PNG, WEBP)' : !sizeOk ? 'Exceeds 10MB limit' : undefined,
      });
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleUploadAll = async () => {
    if (!selectedAlbumId) {
      setGlobalError('Please select a target album before uploading.');
      return;
    }

    const waitingFiles = queue.filter((i) => i.status === 'waiting');
    if (waitingFiles.length === 0) return;

    setIsUploading(true);
    setGlobalError(null);

    setQueue((prev) =>
      prev.map((i) => (i.status === 'waiting' ? { ...i, status: 'uploading' } : i))
    );

    const formData = new FormData();
    formData.append('albumId', selectedAlbumId);
    if (selectedPersonIds.size > 0) {
      formData.append('personIds', JSON.stringify(Array.from(selectedPersonIds)));
    }
    waitingFiles.forEach((i) => formData.append('files', i.file));

    try {
      const res = await fetch('/api/photos/upload', { method: 'POST', body: formData });
      const body = await res.json();

      if (!res.ok || !body.success) throw new Error(body.message || 'Upload failed');

      const { uploaded, failed } = body.data as {
        uploaded: Array<{ photoId: string; filename: string }>;
        failed: Array<{ filename: string; reason: string }>;
      };

      const uploadedMap = new Map(uploaded.map((u) => [u.filename, u.photoId]));
      const failedMap = new Map(failed.map((f) => [f.filename, f.reason]));

      setQueue((prev) =>
        prev.map((item) => {
          if (uploadedMap.has(item.name)) return { ...item, status: 'completed', uploadedPhotoId: uploadedMap.get(item.name) };
          if (failedMap.has(item.name)) return { ...item, status: 'error', errorMessage: failedMap.get(item.name) };
          return item;
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to upload service';
      setGlobalError(msg);
      setQueue((prev) => prev.map((i) => (i.status === 'uploading' ? { ...i, status: 'error', errorMessage: msg } : i)));
    } finally {
      setIsUploading(false);
    }
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const waitingCount = queue.filter((i) => i.status === 'waiting').length;
  const taggedCount = selectedPersonIds.size;

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        badge="ARCHIVE MANAGEMENT"
        title="Upload & Store Center"
        subtitle="Upload high-resolution family photographs directly to Cloudinary and Neon PostgreSQL"
      />

      {globalError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Target Album Selection */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
          Target Destination Album
        </label>
        {albums.length === 0 ? (
          <p className="text-xs text-zinc-500">
            No albums found. Please create an album in the Album Manager before uploading.
          </p>
        ) : (
          <select
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
            disabled={isUploading}
            className="w-full max-w-md px-4 py-3 rounded-2xl bg-zinc-950 border border-white/15 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/60 cursor-pointer disabled:opacity-50"
          >
            {albums.map((album) => (
              <option key={album.id} value={album.id}>{album.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* People Tagger */}
      {people.length > 0 && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Tag Family Members in These Photos
              </label>
            </div>
            {taggedCount > 0 && (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                {taggedCount} tagged
              </span>
            )}
          </div>

          <p className="text-[11px] text-zinc-500 font-sans">
            Select family members who appear in the photos being uploaded. All photos in this batch will be tagged with the selected people.
          </p>

          <div className="flex flex-wrap gap-2">
            {people.map((person) => {
              const selected = selectedPersonIds.has(person.id);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => !isUploading && togglePerson(person.id)}
                  disabled={isUploading}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-sans transition-all cursor-pointer
                    ${selected
                      ? 'bg-amber-400/15 border-amber-400/50 text-amber-300'
                      : 'bg-zinc-800 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 bg-zinc-700 flex items-center justify-center">
                    {person.avatarUrl ? (
                      <Image src={person.avatarUrl} alt={person.name} width={24} height={24} className="object-cover w-6 h-6" />
                    ) : (
                      <UserCircle className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  <span>{person.name}</span>
                  {person.role && (
                    <span className="text-[10px] text-zinc-500 hidden sm:inline">{person.role}</span>
                  )}
                  {selected && <Check className="w-3 h-3 text-amber-400 ml-1" />}
                </button>
              );
            })}
          </div>

          {taggedCount === 0 && (
            <p className="text-[11px] text-zinc-600 font-mono">No people tagged — photos will be uploaded without people associations.</p>
          )}
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.length > 0) processFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
          dragActive ? 'border-amber-400 bg-amber-400/10' : 'border-white/15 bg-zinc-900/40 hover:border-white/30'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-zinc-800 border border-white/10 text-amber-400 shadow-lg">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-white">Drop photographs here</h3>
            <p className="text-xs font-sans text-zinc-400 mt-1">Supports JPG, PNG, and WEBP up to 10MB per file</p>
          </div>
          <Button variant="secondary" size="md">Browse Files from Device</Button>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-white">
              Upload Queue ({queue.length})
              {taggedCount > 0 && (
                <span className="ml-2 text-xs font-sans font-normal text-amber-400">
                  · {taggedCount} {taggedCount === 1 ? 'person' : 'people'} will be tagged
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {waitingCount > 0 && (
                <Button
                  variant="primary"
                  size="md"
                  disabled={isUploading || !selectedAlbumId}
                  icon={isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  onClick={handleUploadAll}
                >
                  {isUploading ? 'Uploading...' : `Upload ${waitingCount} Files`}
                </Button>
              )}
              {completedCount > 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => router.push('/admin/photos')}
                >
                  Go to Photos ({completedCount})
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-4 font-sans text-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                    <Image src={item.previewUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{item.name}</h4>
                    <span className="text-[11px] font-mono text-zinc-500">{item.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {item.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <Check className="w-4 h-4" /> Uploaded
                    </span>
                  ) : item.status === 'error' ? (
                    <span className="text-rose-400 font-medium">{item.errorMessage}</span>
                  ) : item.status === 'uploading' ? (
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <span className="text-zinc-400">Waiting</span>
                  )}

                  {!isUploading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveFile(item.id); }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadCenterPage;
