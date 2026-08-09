'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Upload, X, Check, ArrowRight, FolderPlus, Users, Calendar, MapPin, Tag, Trash2, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface QueuedFile {
  id: string;
  file?: File;
  name: string;
  size: string;
  previewUrl: string;
  progress: number;
  status: 'waiting' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  // Temporary metadata organization fields
  title: string;
  description: string;
  date: string;
  albumId: string;
  tags: string[];
}

export function UploadCenterPage() {
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [step, setStep] = useState<'upload' | 'organize'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | File[]) => {
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];
    const newItems: QueuedFile[] = [];

    Array.from(files).forEach((file, index) => {
      const isTypeValid = validExtensions.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i);
      const isSizeValid = file.size <= 50 * 1024 * 1024; // 50MB max

      const preview = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      newItems.push({
        id: `upload-${Date.now()}-${index}`,
        file,
        name: file.name,
        size: sizeMb,
        previewUrl: preview,
        progress: isTypeValid && isSizeValid ? 100 : 0,
        status: !isTypeValid ? 'error' : !isSizeValid ? 'error' : 'completed',
        errorMessage: !isTypeValid ? 'Unsupported format' : !isSizeValid ? 'Exceeds 50MB limit' : undefined,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        description: '',
        date: new Date().toISOString().split('T')[0],
        albumId: '',
        tags: ['family', 'archive'],
      });
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleUpdateItem = (id: string, key: keyof QueuedFile, value: any) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        badge="ARCHIVE MANAGEMENT"
        title="Upload & Organize Center"
        subtitle="Add high-resolution family photographs to the digital archive"
      />

      {/* Step Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 font-sans text-xs">
        <button
          onClick={() => setStep('upload')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            step === 'upload' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          1. Upload Queue ({queue.length})
        </button>
        <button
          onClick={() => setStep('organize')}
          disabled={completedCount === 0}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            step === 'organize' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          2. Organize Metadata ({completedCount})
        </button>
      </div>

      {step === 'upload' ? (
        <div className="space-y-8">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
              dragActive ? 'border-amber-400 bg-amber-400/10' : 'border-white/15 bg-zinc-900/40 hover:border-white/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic"
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
                  Supports JPG, PNG, WEBP, and HEIC up to 50MB per file
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
                <h3 className="text-lg font-serif font-bold text-white">Upload Processing Queue</h3>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={completedCount === 0}
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setStep('organize')}
                >
                  Proceed to Metadata Organization ({completedCount})
                </Button>
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
                          <Check className="w-4 h-4" /> Ready
                        </span>
                      ) : item.status === 'error' ? (
                        <span className="text-rose-400">{item.errorMessage}</span>
                      ) : (
                        <span className="text-amber-300">Processing...</span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(item.id);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: METADATA ORGANIZATION WORKFLOW */
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-white">Organize Memories</h3>
            <Link href="/admin/photos">
              <Button variant="primary" size="md" icon={<Check className="w-4 h-4" />}>
                Complete & Finish to Media Library
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {queue
              .filter((i) => i.status === 'completed')
              .map((item) => (
                <div key={item.id} className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 font-sans text-xs">
                  <div className="flex gap-4">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shrink-0">
                      <Image src={item.previewUrl} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <Input
                        label="Memory Title"
                        value={item.title}
                        onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                      />
                      <Input
                        label="Captured Date"
                        type="date"
                        value={item.date}
                        onChange={(e) => handleUpdateItem(item.id, 'date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Story Description
                    </label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="Add story details or personal memories..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                    />
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
