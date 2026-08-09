# Walkthrough: Family Photo Gallery Frontend Architecture

We have designed and implemented the complete frontend architecture for **Family Photo Gallery** (Vance Archive)—a digital family memory archive built using Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Lucide icons.

---

## Key Achievements

### 1. Future-Proof Data Access & Service Layer
- **TypeScript Models ([`src/types/index.ts`](file:///d:/Kishor/Others/family-photo-gallary/src/types/index.ts))**: Defined clean data models for `Photo`, `Person`, `Album`, `FamilyEvent`, `PhotoLocation`, `CameraExif`, and `GalleryFilterOptions`.
- **Abstract Service Layer ([`src/services/photoService.ts`](file:///d:/Kishor/Others/family-photo-gallary/src/services/photoService.ts))**: Provides async data provider methods (`getPhotos()`, `getAlbums()`, `getPeople()`, `getAvailableYears()`).
- **Mock Data Store ([`src/services/mock/mockData.ts`](file:///d:/Kishor/Others/family-photo-gallary/src/services/mock/mockData.ts))**: Rich sample data set covering multi-generational family photos, albums, and metadata. Swapping to a Next.js API or Prisma backend in the future will require zero UI rewrites.

---

### 2. Flexible Pluggable Gallery Engine
- **`<GalleryRenderer />` ([`src/components/gallery/GalleryRenderer.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/components/gallery/GalleryRenderer.tsx))**: Decoupled gallery layout component supporting:
  - **Masonry Layout** (Dynamic column heights)
  - **Bento Grid** (Span variation layout)
  - **Editorial Layout** (Large imagery paired with story copy)
  - **Polaroid Gallery** (Realistic tilt angles and paper borders)
  - **Standard Grid** (Responsive grid layout)
- **`<LayoutSwitcher />` ([`src/components/gallery/LayoutSwitcher.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/components/gallery/LayoutSwitcher.tsx))**: Real-time layout switcher toolbar allowing visitors to switch visual gallery views effortlessly.

---

### 3. Global Lightbox Experience
- **[`src/components/lightbox/LightboxModal.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/components/lightbox/LightboxModal.tsx)**:
  - High-resolution photo display with spring animations.
  - Sidebar panel showing photo title, description, tagged family members, camera EXIF details (lens, aperture, shutter speed, ISO), date, location, album references, and tag pills.
  - Keyboard shortcut navigation (`ArrowLeft`, `ArrowRight`, `Escape`).

---

### 4. Public Photo Experience Routes
- **Home Page ([`src/app/page.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/page.tsx))**: Cinematic hero photo showcase, featured Bento gallery, and family member/album teasers.
- **All Photos Page ([`src/app/photos/page.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/photos/page.tsx))**: Search bar, tag filter pills, photo counters, and switchable layouts.
- **Albums & Album Detail ([`src/app/albums/page.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/albums/page.tsx))**: Collection grid showing album stories and individual album galleries.
- **People Directory & Profile Pages ([`src/app/people/page.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/people/page.tsx))**: Family member profiles and associated tagged photos.
- **Timeline Page ([`src/app/timeline/page.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/timeline/page.tsx))**: Chronological year navigation.
- **Favorites Page ([`src/app/favorites/page.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/favorites/page.tsx))**: Collection of starred photos.

---

### 5. Admin Dashboard UI
- **Dashboard Layout ([`src/app/admin/layout.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/admin/layout.tsx))**: Dark editorial control panel sidebar.
- **Overview Page ([`src/app/admin/page.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/admin/page.tsx))**: Archive statistics (Total Photos, Albums, Family Members, Storage Used) and recent upload table.
- **Upload Center ([`src/app/admin/upload/page.tsx`](file:///d:/Kishor/Others/family-photo-gallary/src/app/admin/upload/page.tsx))**: Drag-and-drop upload zone with upload processing queue and progress bars.

---

## Verification & Build Results

- **`npm run build`**: Completed with 0 errors. All static and dynamic routes compiled cleanly.
- **Live Local Server**: Server active at `http://localhost:3000`.
