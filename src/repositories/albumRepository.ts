import "server-only";
import { prisma } from "@/lib/db/prisma";
import { Album } from "@prisma/client";
import { CreateAlbumInput, UpdateAlbumInput } from "@/lib/validators/album";

export interface AlbumWithPhotoCount extends Album {
  _count: {
    photos: number;
  };
}

export class AlbumRepository {
  static async findAll(): Promise<AlbumWithPhotoCount[]> {
    return prisma.album.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { photos: true },
        },
      },
    });
  }

  static async findById(id: string): Promise<AlbumWithPhotoCount | null> {
    return prisma.album.findUnique({
      where: { id },
      include: {
        _count: {
          select: { photos: true },
        },
      },
    });
  }

  static async create(data: CreateAlbumInput): Promise<AlbumWithPhotoCount> {
    return prisma.album.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        coverUrl: data.coverUrl && data.coverUrl.length > 0 ? data.coverUrl : null,
        eventDate: data.eventDate ?? null,
      },
      include: {
        _count: {
          select: { photos: true },
        },
      },
    });
  }

  static async update(id: string, data: UpdateAlbumInput): Promise<AlbumWithPhotoCount> {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl && data.coverUrl.length > 0 ? data.coverUrl : null;
    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate ?? null;

    return prisma.album.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { photos: true },
        },
      },
    });
  }

  static async delete(id: string): Promise<Album> {
    return prisma.album.delete({
      where: { id },
    });
  }

  static async countPhotos(id: string): Promise<number> {
    return prisma.photo.count({
      where: { albumId: id },
    });
  }
}
