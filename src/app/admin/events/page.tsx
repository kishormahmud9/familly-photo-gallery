'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PhotoService } from '@/services/photoService';
import { FamilyEvent } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit2, Trash2, X, Check, Calendar, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<FamilyEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');

  useEffect(() => {
    PhotoService.getEvents().then(setEvents);
  }, []);

  const handleOpenEdit = (evt: FamilyEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDate(evt.date);
    setLocationName(evt.locationName || '');
    setDescription(evt.description || '');
    setCoverPhotoUrl(evt.coverPhotoUrl);
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocationName('');
    setDescription('');
    setCoverPhotoUrl('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80');
    setIsCreating(true);
  };

  const handleSaveEvent = () => {
    if (isCreating) {
      const newEvt: FamilyEvent = {
        id: `evt-${Date.now()}`,
        title,
        date,
        locationName,
        description,
        coverPhotoUrl,
        photoCount: 16,
      };
      setEvents((prev) => [newEvt, ...prev]);
    } else if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...e, title, date, locationName, description, coverPhotoUrl } : e))
      );
    }
    setIsCreating(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        badge="EVENTS MANAGER"
        title="Milestone Gatherings"
        subtitle="Manage family celebrations, anniversaries, and reunions"
        action={
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Create Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-5 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 font-sans text-xs"
          >
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10">
              <Image src={evt.coverPhotoUrl} alt={evt.title} fill className="object-cover" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-amber-400 font-mono text-[11px]">
                <span>{formatDate(evt.date)}</span>
                <span>{evt.photoCount} photos</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">{evt.title}</h3>
              {evt.locationName && (
                <p className="text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {evt.locationName}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(evt)}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteEvent(evt.id)}
                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {(isCreating || editingEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 text-zinc-100 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-serif font-bold text-white">
                {isCreating ? 'Create Milestone Event' : `Edit Event: ${editingEvent?.title}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingEvent(null);
                }}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Input label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Location Name" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Rosewood Manor, Cotswolds" />

            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setEditingEvent(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" icon={<Check className="w-4 h-4" />} onClick={handleSaveEvent}>
                Save Event
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
