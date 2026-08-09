export type PhotoOrientation = 'landscape' | 'portrait' | 'square';

export interface PhotoLocation {
  id: string;
  name: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface CameraExif {
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  description?: string;
  date: string; // ISO format (YYYY-MM-DD)
  year: number;
  peopleIds: string[]; // Person IDs
  albumId?: string;
  albumName?: string;
  eventId?: string;
  eventName?: string;
  location?: PhotoLocation;
  tags: string[];
  width: number;
  height: number;
  aspectRatio: number;
  orientation: PhotoOrientation;
  favorite: boolean;
  featured?: boolean;
  cameraInfo?: CameraExif;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  role?: string; // e.g. "Grandmother", "Father", "Cousin"
  avatarUrl: string;
  bio?: string;
  birthYear?: number;
  photoCount?: number;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverPhotoUrl: string;
  photoCount: number;
  dateRange?: string;
  featured?: boolean;
  defaultLayout?: GalleryLayoutType;
  createdAt: string;
}

export interface FamilyEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  locationName?: string;
  coverPhotoUrl: string;
  photoCount: number;
}

export type GalleryLayoutType =
  | 'grid'
  | 'masonry'
  | 'bento'
  | 'editorial'
  | 'polaroid'
  | 'timeline'
  | 'filmstrip'
  | 'collage'
  | 'cinematic';

export interface GalleryOptions {
  layout: GalleryLayoutType;
  showCaptions?: boolean;
  showMetadata?: boolean;
  enableAnimations?: boolean;
  enableLightbox?: boolean;
}

export interface GalleryFilterOptions {
  searchQuery?: string;
  albumId?: string;
  personId?: string;
  eventId?: string;
  year?: number;
  tag?: string;
  favoritesOnly?: boolean;
  orientation?: PhotoOrientation;
  sortBy?: 'date-desc' | 'date-asc' | 'title' | 'popular';
}
