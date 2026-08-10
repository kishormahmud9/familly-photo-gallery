'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2, AlertCircle } from 'lucide-react';

export type UploadState = 'idle' | 'selecting' | 'uploading' | 'success' | 'error';

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  format: string;
}

interface ImageUploadPickerProps {
  /** Label shown above the picker */
  label: string;
  /** Folder type sent to /api/media/upload */
  folderType: 'covers' | 'avatars' | 'photos';
  /** Whether to display preview as a circle (avatar) or rectangle (cover) */
  shape?: 'circle' | 'rect';
  /** Existing Cloudinary URL to show in edit mode */
  currentImageUrl?: string | null;
  /** Called with the Cloudinary result after a successful upload */
  onUploadSuccess: (result: UploadResult) => void;
  /** Called when the user removes the selected/current image */
  onRemove: () => void;
  /** Optional extra class for the root container */
  className?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function ImageUploadPicker({
  label,
  folderType,
  shape = 'rect',
  currentImageUrl,
  onUploadSuccess,
  onRemove,
  className = '',
}: ImageUploadPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Displayed image: new local preview → current DB URL → nothing
  const displayUrl = previewUrl || currentImageUrl || null;
  const hasImage = Boolean(displayUrl);

  const clearError = () => setErrorMsg(null);

  const processFile = useCallback(
    async (file: File) => {
      clearError();

      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        setErrorMsg('Unsupported format. Please use JPG, PNG, or WEBP.');
        return;
      }
      if (file.size > MAX_BYTES) {
        setErrorMsg('File exceeds 10 MB limit. Please choose a smaller image.');
        return;
      }

      // Show local browser preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploadState('uploading');

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderType', folderType);

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Upload failed. Please try again.');
        }

        setUploadState('success');
        // Replace blob preview with real Cloudinary URL
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(json.data.secureUrl);
        onUploadSuccess(json.data as UploadResult);
      } catch (err: unknown) {
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
        setUploadState('error');
        setErrorMsg(err instanceof Error ? err.message : 'Unable to upload image. Please try again.');
      }
    },
    [folderType, onUploadSuccess]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadState('idle');
    setErrorMsg(null);
    onRemove();
  };

  const isUploading = uploadState === 'uploading';

  const previewClass =
    shape === 'circle'
      ? 'w-28 h-28 rounded-full mx-auto'
      : 'w-full h-44 rounded-2xl';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
        {label}
      </label>

      {/* Preview area */}
      {hasImage && (
        <div className="relative group">
          <div className={`relative overflow-hidden border border-white/10 bg-zinc-950 ${previewClass}`}>
            <Image
              src={displayUrl!}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={displayUrl?.startsWith('blob:')}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Change / Remove controls */}
          {!isUploading && (
            <div className={`mt-2 flex items-center gap-2 ${shape === 'circle' ? 'justify-center' : ''}`}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-mono uppercase tracking-wider transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* Drop zone — only shown when no image is displayed */}
      {!hasImage && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onClick={() => !isUploading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !isUploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed
            cursor-pointer transition-all text-center select-none
            ${isDragging
              ? 'border-amber-400/60 bg-amber-400/5'
              : 'border-white/10 bg-zinc-950 hover:border-amber-400/30 hover:bg-zinc-950/80'
            }
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-zinc-400 font-sans">Uploading to Cloudinary...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-300 font-sans">
                  <span className="text-amber-400 font-medium">Click to browse</span> or drag & drop
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">JPG · PNG · WEBP &nbsp;·&nbsp; Max 10 MB</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-sans">
                <Upload className="w-3.5 h-3.5" />
                Upload Image
              </div>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-sans">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
