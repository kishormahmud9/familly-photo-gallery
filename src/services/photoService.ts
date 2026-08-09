import { Photo, Person, Album, FamilyEvent, GalleryFilterOptions } from '@/types';
import { MOCK_PHOTOS, MOCK_PEOPLE, MOCK_ALBUMS, MOCK_EVENTS } from './mock/mockData';

// Simulated delay helper to mimic API call latency smoothly
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export class PhotoService {
  /**
   * Get all photos with optional filtering & sorting
   */
  static async getPhotos(filters?: GalleryFilterOptions): Promise<Photo[]> {
    await delay();
    let result = [...MOCK_PHOTOS];

    if (!filters) return result;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p: Photo) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q)) ||
          p.albumName?.toLowerCase().includes(q) ||
          p.eventName?.toLowerCase().includes(q)
      );
    }

    if (filters.albumId) {
      result = result.filter((p: Photo) => p.albumId === filters.albumId);
    }

    if (filters.personId) {
      result = result.filter((p: Photo) => p.peopleIds.includes(filters.personId!));
    }

    if (filters.eventId) {
      result = result.filter((p: Photo) => p.eventId === filters.eventId);
    }

    if (filters.year) {
      result = result.filter((p: Photo) => p.year === filters.year);
    }

    if (filters.favoritesOnly) {
      result = result.filter((p: Photo) => p.favorite);
    }

    if (filters.orientation) {
      result = result.filter((p: Photo) => p.orientation === filters.orientation);
    }

    if (filters.tag) {
      result = result.filter((p: Photo) => p.tags.includes(filters.tag!));
    }

    // Sort
    if (filters.sortBy === 'date-asc') {
      result.sort((a: Photo, b: Photo) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (filters.sortBy === 'title') {
      result.sort((a: Photo, b: Photo) => a.title.localeCompare(b.title));
    } else {
      // Default: date-desc
      result.sort((a: Photo, b: Photo) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }

  static async getPhotoById(id: string): Promise<Photo | null> {
    await delay();
    return MOCK_PHOTOS.find((p: Photo) => p.id === id) || null;
  }

  static async getFeaturedPhotos(): Promise<Photo[]> {
    await delay();
    return MOCK_PHOTOS.filter((p: Photo) => p.featured);
  }

  static async getFavoritePhotos(): Promise<Photo[]> {
    await delay();
    return MOCK_PHOTOS.filter((p: Photo) => p.favorite);
  }

  /**
   * People Data Access
   */
  static async getPeople(): Promise<Person[]> {
    await delay();
    return MOCK_PEOPLE;
  }

  static async getPersonById(id: string): Promise<Person | null> {
    await delay();
    return MOCK_PEOPLE.find((p: Person) => p.id === id) || null;
  }

  /**
   * Album Data Access
   */
  static async getAlbums(): Promise<Album[]> {
    await delay();
    return MOCK_ALBUMS;
  }

  static async getAlbumById(id: string): Promise<Album | null> {
    await delay();
    return MOCK_ALBUMS.find((a: Album) => a.id === id) || null;
  }

  /**
   * Event Data Access
   */
  static async getEvents(): Promise<FamilyEvent[]> {
    await delay();
    return MOCK_EVENTS;
  }

  static async getEventById(id: string): Promise<FamilyEvent | null> {
    await delay();
    return MOCK_EVENTS.find((e: FamilyEvent) => e.id === id) || null;
  }

  /**
   * Get unique years for timeline view
   */
  static async getAvailableYears(): Promise<number[]> {
    await delay();
    const years = Array.from(new Set(MOCK_PHOTOS.map((p: Photo) => p.year)));
    return years.sort((a: number, b: number) => b - a);
  }
}
