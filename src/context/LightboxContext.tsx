'use client';

import React, { createContext, useContext, useState } from 'react';
import { Photo } from '@/types';

interface LightboxContextType {
  activePhoto: Photo | null;
  photos: Photo[];
  isOpen: boolean;
  openLightbox: (photo: Photo, photoList?: Photo[]) => void;
  closeLightbox: () => void;
  nextPhoto: () => void;
  prevPhoto: () => void;
}

const LightboxContext = createContext<LightboxContextType | undefined>(undefined);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (photo: Photo, photoList: Photo[] = []) => {
    setActivePhoto(photo);
    if (photoList.length > 0) {
      setPhotos(photoList);
    } else if (photos.length === 0) {
      setPhotos([photo]);
    }
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setTimeout(() => setActivePhoto(null), 200);
  };

  const nextPhoto = () => {
    if (!activePhoto || photos.length <= 1) return;
    const currentIndex = photos.findIndex((p) => p.id === activePhoto.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    setActivePhoto(photos[nextIndex]);
  };

  const prevPhoto = () => {
    if (!activePhoto || photos.length <= 1) return;
    const currentIndex = photos.findIndex((p) => p.id === activePhoto.id);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setActivePhoto(photos[prevIndex]);
  };

  return (
    <LightboxContext.Provider
      value={{
        activePhoto,
        photos,
        isOpen,
        openLightbox,
        closeLightbox,
        nextPhoto,
        prevPhoto,
      }}
    >
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider');
  }
  return context;
}
