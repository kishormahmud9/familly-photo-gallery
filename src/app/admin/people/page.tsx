'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PhotoService } from '@/services/photoService';
import { Person } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploadPicker, UploadResult } from '@/components/ui/ImageUploadPicker';
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Loader2, UserCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/Feedback';

export default function AdminPeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [birthYear, setBirthYear] = useState<number>(1990);
  // Cloudinary-resolved avatar (set by ImageUploadPicker on success)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPublicId, setAvatarPublicId] = useState<string | null>(null);

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const data = await PhotoService.getAdminPeople();
      setPeople(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const resetForm = () => {
    setName('');
    setRole('');
    setBio('');
    setBirthYear(1990);
    setAvatarUrl(null);
    setAvatarPublicId(null);
    setErrorMessage(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingPerson(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (person: Person) => {
    setEditingPerson(person);
    setName(person.name);
    setRole(person.role || '');
    setBio(person.bio || '');
    setBirthYear(person.birthYear || 1990);
    // Populate existing avatar from DB record
    setAvatarUrl(person.avatarUrl || null);
    setAvatarPublicId((person as any).cloudinaryPublicId || null);
    setErrorMessage(null);
    setIsCreating(false);
  };

  const handleAvatarUploaded = (result: UploadResult) => {
    setAvatarUrl(result.secureUrl);
    setAvatarPublicId(result.publicId);
  };

  const handleAvatarRemoved = () => {
    setAvatarUrl(null);
    setAvatarPublicId(null);
  };

  const handleSavePerson = async () => {
    if (!name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        role: role.trim() || null,
        bio: bio.trim() || null,
        birthYear: Number(birthYear) || null,
        avatarUrl: avatarUrl || null,
        cloudinaryPublicId: avatarPublicId || null,
      };

      if (isCreating) {
        const res = await fetch('/api/people', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.message || 'Failed to create family member profile');
        }
      } else if (editingPerson) {
        const res = await fetch(`/api/people/${editingPerson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.message || 'Failed to update family member profile');
        }
      }

      setIsCreating(false);
      setEditingPerson(null);
      resetForm();
      await fetchPeople();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while saving the profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePerson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this family member profile?')) return;

    try {
      const res = await fetch(`/api/people/${id}`, { method: 'DELETE' });
      const body = await res.json();

      if (!res.ok || !body.success) {
        alert(body.message || 'Failed to delete profile.');
        return;
      }

      await fetchPeople();
    } catch {
      alert('Network error while deleting profile.');
    }
  };

  const modalOpen = isCreating || Boolean(editingPerson);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        badge="DIRECTORY MANAGER"
        title="Family Members"
        subtitle="Manage family profiles and relationships in Neon PostgreSQL"
        action={
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Add Family Member
          </Button>
        }
      />

      {/* Content / Loading / Empty */}
      {isLoading ? (
        <div className="py-20 text-center text-zinc-500 font-sans text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          Loading family members from database...
        </div>
      ) : people.length === 0 ? (
        <EmptyState
          title="No Family Members Found"
          description="Your database currently has no family member profiles. Add your first family member."
          action={
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
              Add Family Member
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <div
              key={person.id}
              className="p-5 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-4 font-sans text-xs shadow-xl"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shrink-0 bg-zinc-800 flex items-center justify-center">
                  {person.avatarUrl ? (
                    <Image src={person.avatarUrl} alt={person.name} fill className="object-cover" />
                  ) : (
                    <UserCircle className="w-8 h-8 text-zinc-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-amber-400 font-medium">
                    {person.role}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white truncate">{person.name}</h3>
                  {person.birthYear && (
                    <p className="text-zinc-500 font-mono text-[11px]">Born {person.birthYear}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(person)}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Edit Person"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePerson(person.id)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Delete Person"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 text-zinc-100 font-sans text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-serif font-bold text-white">
                {isCreating ? 'Add Family Member' : `Edit Profile: ${editingPerson?.name}`}
              </h3>
              <button
                onClick={() => { setIsCreating(false); setEditingPerson(null); resetForm(); }}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile photo upload — replaces avatar URL input */}
            <ImageUploadPicker
              label="Profile Photo (Optional)"
              folderType="avatars"
              shape="circle"
              currentImageUrl={avatarUrl}
              onUploadSuccess={handleAvatarUploaded}
              onRemove={handleAvatarRemoved}
            />

            <Input
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
            />
            <Input
              label="Family Role / Relationship"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Grandmother, Son, Cousin"
            />
            <Input
              label="Birth Year"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
            />

            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Short Biography
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief description of this family member..."
                className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={() => { setIsCreating(false); setEditingPerson(null); resetForm(); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                onClick={handleSavePerson}
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
