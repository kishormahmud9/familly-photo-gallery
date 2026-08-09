'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, X, Check, FileText } from 'lucide-react';
import Image from 'next/image';

interface QueuedFile {
  id: string;
  name: string;
  size: string;
  previewUrl: string;
  progress: number;
  status: 'uploading' | 'completed';
}

export function UploadCenterPage() {
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);

  const handleSimulatedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    // Simulate adding demo upload queue items
    const newItems: QueuedFile[] = [
      {
        id: 'u1',
        name: 'Family_Reunion_2024_01.jpg',
        size: '4.2 MB',
        previewUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=300&q=80',
        progress: 100,
        status: 'completed',
      },
      {
        id: 'u2',
        name: 'Grandma_Birthday_Cake.png',
        size: '6.8 MB',
        previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80',
        progress: 65,
        status: 'uploading',
      },
    ];

    setQueue((prev) => [...prev, ...newItems]);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-serif font-bold text-white">Upload Center</h1>
        <p className="text-xs font-mono text-amber-400 mt-1">
          Drag and drop high-resolution photographs to preserve
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleSimulatedDrop}
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-amber-400 bg-amber-400/10'
            : 'border-white/15 bg-zinc-900/40 hover:border-white/30'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-zinc-800 border border-white/10 text-amber-400">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-white">Drop photographs here</h3>
            <p className="text-xs font-mono text-zinc-400 mt-1">Supports JPG, PNG, WEBP, and RAW formats up to 50MB</p>
          </div>
          <button
            onClick={() => {
              // Trigger demo queue item
              setQueue([
                {
                  id: 'u1',
                  name: 'Tuscany_Sunlines_RAW.jpg',
                  size: '12.4 MB',
                  previewUrl:
                    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=300&q=80',
                  progress: 100,
                  status: 'completed',
                },
              ]);
            }}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-200 hover:text-white hover:border-amber-400/40 transition-all"
          >
            Browse files (Demo simulation)
          </button>
        </div>
      </div>

      {/* Upload Queue Interface */}
      {queue.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-white">Upload Processing Queue</h2>

          <div className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <Image src={item.previewUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white">{item.name}</h4>
                    <span className="text-[11px] font-mono text-zinc-500">{item.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-xs">
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-amber-400">{item.progress}%</span>
                </div>

                <div>
                  {item.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                      <Check className="w-4 h-4" /> Ready
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-amber-300">Processing...</span>
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
