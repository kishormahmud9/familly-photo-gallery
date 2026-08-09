'use client';

import React from 'react';
import { Photo, GalleryLayoutType, GalleryOptions } from '@/types';
import { useLightbox } from '@/context/LightboxContext';
import { GALLERY_REGISTRY } from './galleryRegistry';
import { EmptyState } from '../ui/Feedback';

interface GalleryRendererProps {
  layout?: GalleryLayoutType;
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  options?: GalleryOptions;
}

export function GalleryRenderer({ layout = 'masonry', photos, onPhotoClick, options }: GalleryRendererProps) {
  const { openLightbox } = useLightbox();

  const selectedLayout = options?.layout || layout;

  const handlePhotoSelect = (photo: Photo) => {
    if (onPhotoClick) {
      onPhotoClick(photo);
    } else {
      openLightbox(photo, photos);
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <EmptyState
        title="No memories found"
        description="Try adjusting your filter or search criteria to discover family photographs."
      />
    );
  }

  const LayoutComponent = GALLERY_REGISTRY[selectedLayout] || GALLERY_REGISTRY.grid;

  return <LayoutComponent photos={photos} onSelect={handlePhotoSelect} />;
}
