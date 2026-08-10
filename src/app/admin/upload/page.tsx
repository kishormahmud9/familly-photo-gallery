'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Upload, X, Check, ArrowRight, FolderPlus, RefreshCw, AlertCircle } from 'lucide-react';
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

export function UploadCenterPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [albums, setAlbums] = useState<AlbumOption[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/albums', { cache: 'no-store' })
      .then((res) => res.json())
      .then((body) => {
        if (body.success && Array.isArray(body.data)) {
          setAlbums(body.data);
          if (body.data.length > 0) {
            setSelectedAlbumId(body.data[0].id);
          }
        }
      })
      .catch(() => setGlobalError('Failed to fetch albums'));
  }, []);

  const processFiles = (files: FileList | File[]) => {
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const newItems: QueuedFile[] = [];

    Array.from(files).forEach((file, index) => {
      const isTypeValid = validExtensions.includes(file.type.toLowerCase()) || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
      const isSizeValid = file.size <= 10 * 1024 * 1024; // 10MB max limit

      const preview = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      newItems.push({
        id: `upload-${Date.now()}-${index}-${Math.random()}`,
        file,
        name: file.name,
        size: sizeMb,
        previewUrl: preview,
        status: !isTypeValid ? 'error' : !isSizeValid ? 'error' : 'waiting',
        errorMessage: !isTypeValid ? 'Unsupported format (Use JPG, PNG, WEBP)' : !isSizeValid ? 'Exceeds 10MB limit' : undefined,
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

    const waitingFiles = queue.filter((item) => item.status === 'waiting');
    if (waitingFiles.length === 0) return;

    setIsUploading(true);
    setGlobalError(null);

    // Mark as uploading
    setQueue((prev) =>
      prev.map((item) => (item.status === 'waiting' ? { ...item, status: 'uploading' } : item))
    );

    const formData = new FormData();
    formData.append('albumId', selectedAlbumId);
    waitingFiles.forEach((item) => {
      formData.append('files', item.file);
    });

    try {
      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.message || 'Upload failed');
      }

      const { uploaded, failed } = body.data as {
        uploaded: Array<{ photoId: string; filename: string }>;
        failed: Array<{ filename: string; reason: string }>;
      };

      const uploadedMap = new Map(uploaded.map((u) => [u.filename, u.photoId]));
      const failedMap = new Map(failed.map((f) => [f.filename, f.reason]));

      setQueue((prev) =>
        prev.map((item) => {
          if (uploadedMap.has(item.name)) {
            return {
              ...item,
              status: 'completed',
              uploadedPhotoId: uploadedMap.get(item.name),
            };
          }
          if (failedMap.has(item.name)) {
            return {
              ...item,
              status: 'error',
              errorMessage: failedMap.get(item.name),
            };
          }
          return item;
        })
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to upload service';
      setGlobalError(errorMsg);
      setQueue((prev) =>
        prev.map((item) => (item.status === 'uploading' ? { ...item, status: 'error', errorMessage: errorMsg } : item))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const waitingCount = queue.filter((i) => i.status === 'waiting').length;

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
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4">
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
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
          }
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
            <p className="text-xs font-sans text-zinc-400 mt-1">
              Supports JPG, PNG, and WEBP up to 10MB per file
            </p>
          </div>
          <Button variant="secondary" size="md">
            Browse Files from Device
          </Button>
        </div>
      </div>

      {/* Queue Listing */}
      {queue.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-white">
              Upload Processing Queue ({queue.length})
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
                  {isUploading ? 'Uploading to Cloudinary...' : `Upload ${waitingCount} Files to Cloudinary`}
                </Button>
              )}
              {completedCount > 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => router.push('/admin/photos')}
                >
                  Go to Photos Library ({completedCount})
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
                      <Check className="w-4 h-4" /> Uploaded to Cloudinary
                    </span>
                  ) : item.status === 'error' ? (
                    <span className="text-rose-400 font-medium">{item.errorMessage}</span>
                  ) : item.status === 'uploading' ? (
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <span className="text-zinc-400">Waiting for upload</span>
                  )}

                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(item.id);
                      }}
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
