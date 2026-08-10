import { Photo, Person, Album, FamilyEvent, GalleryFilterOptions } from '@/types';
import { MOCK_PHOTOS, MOCK_PEOPLE, MOCK_ALBUMS, MOCK_EVENTS } from './mock/mockData';

// Helper to map DB Photo object to frontend Photo interface
function mapDbPhotoToFrontend(p: any): Photo {
  return {
    id: p.id,
    url: p.imageUrl,
    thumbnailUrl: p.thumbUrl || p.imageUrl,
    title: p.title || p.filename,
    description: p.description || '',
    date: new Date(p.createdAt).toISOString().split('T')[0],
    year: new Date(p.createdAt).getFullYear(),
    peopleIds: [],
    albumId: p.albumId,
    tags: ['family'],
    width: p.width || 1200,
    height: p.height || 800,
    aspectRatio: p.width && p.height ? p.width / p.height : 1.5,
    orientation: p.width && p.height && p.height > p.width ? 'portrait' : 'landscape',
    favorite: false,
    createdAt: p.createdAt,
  };
}

// Helper to map DB Album object to frontend Album interface
function mapDbAlbumToFrontend(a: any): Album {
  return {
    id: a.id,
    title: a.title,
    description: a.description || '',
    coverPhotoUrl: a.coverUrl || (a.photos && a.photos[0]?.imageUrl) || '/albums/summer-vacation.jpg',
    photoCount: a.photoCount ?? a._count?.photos ?? 0,
    dateRange: a.eventDate ? new Date(a.eventDate).getFullYear().toString() : new Date(a.createdAt).getFullYear().toString(),
    createdAt: a.createdAt || new Date().toISOString(),
  };
}

// Helper to map DB Person object to frontend Person interface
function mapDbPersonToFrontend(p: any): Person {
  return {
    id: p.id,
    name: p.name,
    role: p.role || 'Family Member',
    avatarUrl: p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: p.bio || '',
    birthYear: p.birthYear || undefined,
    photoCount: 0,
  };
}

export class PhotoService {
  // ── ADMIN METHODS (Strictly Real Data, Zero Mock Fallback) ──────────────────

  static async getAdminPhotos(filters?: GalleryFilterOptions): Promise<Photo[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.albumId) params.set('albumId', filters.albumId);
      if (filters?.searchQuery) params.set('search', filters.searchQuery);

      const queryString = params.toString();
      const url = `/api/photos${queryString ? `?${queryString}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data?.items && Array.isArray(body.data.items)) {
          return body.data.items.map(mapDbPhotoToFrontend);
        }
      }
    } catch {
      // Error fetching API
    }
    return []; // Strict empty array for Admin
  }

  static async getAdminAlbums(): Promise<Album[]> {
    try {
      const res = await fetch('/api/albums', { cache: 'no-store' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          return body.data.map(mapDbAlbumToFrontend);
        }
      }
    } catch {
      // Error fetching API
    }
    return []; // Strict empty array for Admin
  }

  static async getAdminPeople(): Promise<Person[]> {
    try {
      const res = await fetch('/api/people', { cache: 'no-store' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          return body.data.map(mapDbPersonToFrontend);
        }
      }
    } catch {
      // Error fetching API
    }
    return []; // Strict empty array for Admin
  }

  // ── PUBLIC METHODS (Uses Real DB Data First, Falls Back to Demo Content) ────

  static async getPhotos(filters?: GalleryFilterOptions): Promise<Photo[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.albumId) params.set('albumId', filters.albumId);
      if (filters?.searchQuery) params.set('search', filters.searchQuery);

      const queryString = params.toString();
      const url = `/api/photos${queryString ? `?${queryString}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data?.items && Array.isArray(body.data.items) && body.data.items.length > 0) {
          return body.data.items.map(mapDbPhotoToFrontend);
        }
      }
    } catch {
      // API unavailable — fallback to public demo items
    }

    // Public Fallback
    let result = [...MOCK_PHOTOS];
    if (!filters) return result;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p: Photo) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q)) ||
          p.albumName?.toLowerCase().includes(q)
      );
    }
    if (filters.albumId) {
      result = result.filter((p: Photo) => p.albumId === filters.albumId);
    }
    return result;
  }

  static async getPhotoById(id: string): Promise<Photo | null> {
    try {
      const res = await fetch(`/api/photos/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return mapDbPhotoToFrontend(body.data);
        }
      }
    } catch {
      // Fallback
    }
    return MOCK_PHOTOS.find((p: Photo) => p.id === id) || null;
  }

  static async getAlbums(): Promise<Album[]> {
    try {
      const res = await fetch('/api/albums', { cache: 'no-store' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data) && body.data.length > 0) {
          return body.data.map(mapDbAlbumToFrontend);
        }
      }
    } catch {
      // Fallback
    }
    return MOCK_ALBUMS;
  }

  static async getAlbumById(id: string): Promise<Album | null> {
    try {
      const res = await fetch(`/api/albums/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return mapDbAlbumToFrontend(body.data);
        }
      }
    } catch {
      // Fallback
    }
    return MOCK_ALBUMS.find((a: Album) => a.id === id) || null;
  }

  static async getPeople(): Promise<Person[]> {
    try {
      const res = await fetch('/api/people', { cache: 'no-store' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data) && body.data.length > 0) {
          return body.data.map(mapDbPersonToFrontend);
        }
      }
    } catch {
      // Fallback
    }
    return MOCK_PEOPLE;
  }

  static async getPersonById(id: string): Promise<Person | null> {
    try {
      const res = await fetch(`/api/people/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return mapDbPersonToFrontend(body.data);
        }
      }
    } catch {
      // Fallback
    }
    return MOCK_PEOPLE.find((p: Person) => p.id === id) || null;
  }

  static async getFeaturedPhotos(): Promise<Photo[]> {
    const realPhotos = await this.getPhotos();
    if (realPhotos.length > 0) {
      return realPhotos.slice(0, 6);
    }
    return MOCK_PHOTOS.filter((p: Photo) => p.featured);
  }

  static async getFavoritePhotos(): Promise<Photo[]> {
    return MOCK_PHOTOS.filter((p: Photo) => p.favorite);
  }

  static async getEvents(): Promise<FamilyEvent[]> {
    return MOCK_EVENTS;
  }

  static async getEventById(id: string): Promise<FamilyEvent | null> {
    return MOCK_EVENTS.find((e: FamilyEvent) => e.id === id) || null;
  }

  static async getAvailableYears(): Promise<number[]> {
    const photos = await this.getPhotos();
    const years = Array.from(new Set(photos.map((p: Photo) => p.year)));
    return years.sort((a: number, b: number) => b - a);
  }
}
