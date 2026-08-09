# Architecture & Implementation Plan: Family Photo Gallery

This document outlines the proposed frontend architecture, data modeling, gallery engine design, and phased development strategy for **Family Photo Gallery**—a premium, modern digital family archive.

---

## 1. Architectural Overview & API Decoupling Strategy

To ensure seamless future backend integration (Next.js API routes / Prisma / PostgreSQL / Cloud Storage) without rewriting UI components, we establish a strict **Service & Provider Layer Pattern**.

```mermaid
graph TD
    UI[Page & Component Layer] --> Service[Photo / Gallery Services Interface]
    Service --> Mock[Mock Data Provider (Initial Phase)]
    Service -.-> API[REST / GraphQL / Server Actions (Future Phase)]
```

### Key Architectural Layers:
1. **Types & Models (`/types`)**: Pure TypeScript definitions for core entities (Photo, Album, Person, Event, Location, etc.).
2. **Data Access Services (`/services`)**: Abstract API interface contracts. UI components rely *only* on service methods (`getPhotos()`, `getAlbums()`, `getPhotoById()`, `updatePhoto()`).
3. **Mock Data Provider (`/services/mock`)**: Concrete implementation populated with realistic, rich sample data. Transitioning to full-stack simply requires swapping out or extending the service implementations.
4. **Gallery Engine Architecture (`/components/gallery`)**: Switchable visual presentation engine receiving standardized photo arrays, settings, and layout parameters.

---

## 2. Recommended Route Structure (Next.js App Router)

```
app/
├── (public)/                       # Public Photo Experience Group
│   ├── page.tsx                    # Hero Showcase & Dynamic Visual Entry
│   ├── photos/
│   │   ├── page.tsx                # All Photos (Switchable Gallery Views)
│   │   └── [id]/page.tsx           # Photo Detail Page (or Modal Lightbox)
│   ├── timeline/
│   │   └── page.tsx                # Interactive Chronological View
│   ├── people/
│   │   ├── page.tsx                # Family Members Directory
│   │   └── [id]/page.tsx           # Photos & Memories per Person
│   ├── albums/
│   │   ├── page.tsx                # Album Grid Showcase
│   │   └── [id]/page.tsx           # Album Detail Page
│   ├── events/
│   │   ├── page.tsx                # Key Family Celebrations & Milestones
│   │   └── [id]/page.tsx           # Event Detail & Memory Collection
│   ├── locations/
│   │   └── page.tsx                # Geolocation & Interactive Map View
│   ├── favorites/
│   │   └── page.tsx                # Saved & Favorited Memories
│   └── search/
│       └── page.tsx                # Deep Search & Tag Filtering
│
├── (admin)/                        # Admin Management Dashboard
│   ├── admin/
│   │   ├── page.tsx                # Metrics Overview & Recent Uploads
│   │   ├── photos/
│   │   │   └── page.tsx            # Photo Manager (Grid, Bulk Edit, Filter)
│   │   ├── upload/
│   │   │   └── page.tsx            # Upload Center (Drag & Drop, Metadata Tagging)
│   │   ├── albums/
│   │   │   └── page.tsx            # Album Management & Layout Selection
│   │   ├── people/
│   │   │   └── page.tsx            # Family Member Profile Manager
│   │   └── events/
│   │       └── page.tsx            # Event & Milestone Management
│
├── layout.tsx                      # Root Layout (Fonts, Global Providers, Theme)
└── globals.css                     # Design System Tokens & Base CSS
```

---

## 3. Recommended Folder & Component Hierarchy

```
/
├── src/ (or root app folder)
│   ├── app/                        # App Router Pages & Layouts
│   ├── components/
│   │   ├── ui/                     # Base Primitives (Button, Modal, Input, Badge, Dropdown)
│   │   ├── common/                 # Header, Navigation, Footer, ThemeToggle, Breadcrumbs
│   │   ├── lightbox/               # Premium Lightbox Modal (Zoom, Exif, Related, Navigation)
│   │   ├── gallery/                # Flexible Gallery Layout Engine
│   │   │   ├── GalleryRenderer.tsx # Main switch component (layout switch)
│   │   │   ├── layouts/
│   │   │   │   ├── MasonryGallery.tsx
│   │   │   │   ├── StandardGrid.tsx
│   │   │   │   ├── BentoGrid.tsx
│   │   │   │   ├── EditorialGallery.tsx
│   │   │   │   ├── PolaroidGallery.tsx
│   │   │   │   ├── FilmStripGallery.tsx
│   │   │   │   ├── TimelineGallery.tsx
│   │   │   │   └── FullscreenGallery.tsx
│   │   │   └── controls/           # Layout Switcher Toolbar, Filter Pills
│   │   ├── public/                 # Public-specific Cards, Story Headers, Timelines
│   │   └── admin/                  # Admin Tables, Upload Zone, Metadata Forms, Stats Cards
│   ├── types/                      # TypeScript Contracts (photo.ts, album.ts, etc.)
│   ├── services/                   # Abstract services & Mock providers
│   │   ├── mock/                   # Mock datasets & simulated delays
│   │   ├── photoService.ts
│   │   ├── albumService.ts
│   │   ├── personService.ts
│   │   └── eventService.ts
│   ├── lib/                        # Helpers, formatting, layout logic, constants
│   └── hooks/                      # Custom React hooks (usePhotos, useLightbox, useLayout)
```

---

## 4. Core TypeScript Data Models

### `types/photo.ts`
```typescript
export type PhotoOrientation = 'landscape' | 'portrait' | 'square';

export interface PhotoLocation {
  id: string;
  name: string; // e.g. "Paris, France"
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  year: number;
  peopleIds: string[]; // Reference to Person.id
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
  cameraInfo?: {
    make?: string;
    model?: string;
    focalLength?: string;
    aperture?: string;
    iso?: string;
  };
  createdAt: string;
}
```

### Supporting Entity Types (`types/entities.ts`)
- **`Person`**: `id`, `name`, `relationship`, `avatarUrl`, `bio`, `birthDate`, `photoCount`.
- **`Album`**: `id`, `title`, `description`, `coverPhotoUrl`, `photoIds`, `defaultLayout`, `createdAt`.
- **`Event`**: `id`, `title`, `date`, `location`, `description`, `coverPhotoUrl`.
- **`GalleryLayoutType`**: `'masonry' | 'grid' | 'bento' | 'editorial' | 'polaroid' | 'filmstrip' | 'timeline' | 'fullscreen'`.

---

## 5. Gallery Engine Architecture

The `<GalleryRenderer />` component abstracts the layout implementation, dynamically selecting the requested design layout while exposing consistent callbacks (e.g. `onPhotoClick`, `onFavoriteToggle`).

```tsx
interface GalleryRendererProps {
  layout: GalleryLayoutType;
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  settings?: {
    columns?: number;
    gap?: number;
    showCaption?: boolean;
    aspectRatio?: string;
  };
}
```

---

## 6. Design System & Animation Philosophy

- **Color Palette**: Sophisticated warm charcoal (`#121214`), ivory paper (`#FDFBF7`), subtle warm greys, soft gold accents.
- **Typography**: Editorial serif for headers (e.g., *Playfair Display* / *Cinzel* / *Newsreader*) paired with clean geometric sans for UI text (*Inter* / *Plus Jakarta Sans*).
- **Animations (Framer Motion)**:
  - Micro-interactions: Soft hover elevation, subtle image zoom (`scale: 1.03`).
  - Page Transitions: Fade and slight y-axis slide on route changes.
  - Staggered Gallery Reveals: Smooth item entrance animations with staggered delay.
  - Lightbox: Seamless spring physics for modal expand/collapse.

---

## 7. Phased Implementation Roadmap

1. **Phase 1: Project Setup & Core Foundation**
   - Initialize Next.js app with Tailwind, Framer Motion, and Lucide Icons.
   - Set up TypeScript definitions, mock data services, and design tokens (fonts, colors).
2. **Phase 2: Gallery Engine & Public Experience**
   - Build switchable `GalleryRenderer` with key layouts (Masonry, Bento, Editorial, Polaroid, Standard Grid).
   - Build Public Pages (Home, All Photos, Albums, People, Timeline, Lightbox).
3. **Phase 3: Admin Dashboard**
   - Implement Admin Layout, Stats Overview, Upload Drag-and-Drop UI, Photo Manager, and Album/Person Editors.
4. **Phase 4: Polish & Refinement**
   - Implement animations, fine-tune responsiveness, polish metadata lightbox, and conduct edge-case testing.

---

## User Review Required

> [!IMPORTANT]
> Please review this architecture plan. If you are satisfied with this structure, let me know when you would like to proceed with **Phase 1 (Initializing Next.js project structure, Tailwind config, TypeScript models, and Mock Data layer)**.
