'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PhotoService } from '@/services/photoService';
import { Person } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function AdminPeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [birthYear, setBirthYear] = useState<number>(1980);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    PhotoService.getPeople().then(setPeople);
  }, []);

  const handleOpenEdit = (person: Person) => {
    setEditingPerson(person);
    setName(person.name);
    setRole(person.role || '');
    setBio(person.bio || '');
    setBirthYear(person.birthYear || 1980);
    setAvatarUrl(person.avatarUrl);
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingPerson(null);
    setName('');
    setRole('');
    setBio('');
    setBirthYear(1990);
    setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setIsCreating(true);
  };

  const handleSavePerson = () => {
    if (isCreating) {
      const newPerson: Person = {
        id: `p-${Date.now()}`,
        name,
        role,
        avatarUrl,
        bio,
        birthYear: Number(birthYear),
        photoCount: 0,
      };
      setPeople((prev) => [...prev, newPerson]);
    } else if (editingPerson) {
      setPeople((prev) =>
        prev.map((p) => (p.id === editingPerson.id ? { ...p, name, role, bio, birthYear: Number(birthYear), avatarUrl } : p))
      );
    }
    setIsCreating(false);
    setEditingPerson(null);
  };

  const handleDeletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        badge="DIRECTORY MANAGER"
        title="Family Members"
        subtitle="Manage family profiles, relationships, and biography data"
        action={
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Add Family Member
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person) => (
          <div
            key={person.id}
            className="p-5 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-4 font-sans text-xs"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                <Image src={person.avatarUrl} alt={person.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-sans uppercase tracking-widest text-amber-400 font-medium">
                  {person.role}
                </span>
                <h3 className="text-lg font-serif font-bold text-white truncate">{person.name}</h3>
                {person.birthYear && <p className="text-zinc-500 font-mono text-[11px]">Born {person.birthYear}</p>}
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

      {/* Form Modal */}
      {(isCreating || editingPerson) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 text-zinc-100 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-serif font-bold text-white">
                {isCreating ? 'Add Family Member' : `Edit Profile: ${editingPerson?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingPerson(null);
                }}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Family Role / Relationship" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Grandmother, Son, Cousin" />
            <Input label="Birth Year" type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} />

            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Short Biography
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPerson(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" icon={<Check className="w-4 h-4" />} onClick={handleSavePerson}>
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
