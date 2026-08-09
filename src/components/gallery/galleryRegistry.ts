'use client';

import React from 'react';
import { GalleryLayoutType, Photo } from '@/types';
import {
  StandardGridLayout,
  MasonryLayout,
  BentoLayout,
  EditorialLayout,
  PolaroidLayout,
  TimelineLayout,
  FilmStripLayout,
  CollageLayout,
  CinematicLayout,
} from './layouts/GalleryLayouts';

export type GalleryLayoutComponent = React.ComponentType<{
  photos: Photo[];
  onSelect: (photo: Photo) => void;
}>;

export const GALLERY_REGISTRY: Record<GalleryLayoutType, GalleryLayoutComponent> = {
  grid: StandardGridLayout,
  masonry: MasonryLayout,
  bento: BentoLayout,
  editorial: EditorialLayout,
  polaroid: PolaroidLayout,
  timeline: TimelineLayout,
  filmstrip: FilmStripLayout,
  collage: CollageLayout,
  cinematic: CinematicLayout,
};
