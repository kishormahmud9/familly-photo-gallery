import "server-only";
import { prisma } from "@/lib/db/prisma";
import { Photo, Prisma } from "@prisma/client";
import { PhotoQueryInput, UpdatePhotoInput } from "@/lib/validators/photo";

export interface PaginatedPhotos {
  items: Photo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PhotoRepository {
  static async findPaginated(query: PhotoQueryInput): Promise<PaginatedPhotos> {
    const { page, limit, albumId, search, sortBy } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PhotoWhereInput = {};

    if (albumId) {
      where.albumId = albumId;
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { filename: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.PhotoOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "createdAt-asc") orderBy = { createdAt: "asc" };
    if (sortBy === "title-asc") orderBy = { title: "asc" };

    const [items, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.photo.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async findById(id: string): Promise<Photo | null> {
    return prisma.photo.findUnique({
      where: { id },
    });
  }

  static async findByIds(ids: string[]): Promise<Photo[]> {
    return prisma.photo.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  static async update(id: string, data: UpdatePhotoInput): Promise<Photo> {
    return prisma.photo.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<Photo> {
    return prisma.photo.delete({
      where: { id },
    });
  }

  static async deleteMany(ids: string[]): Promise<Prisma.BatchPayload> {
    return prisma.photo.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  static async moveManyToAlbum(ids: string[], targetAlbumId: string): Promise<Prisma.BatchPayload> {
    return prisma.photo.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        albumId: targetAlbumId,
      },
    });
  }
}
