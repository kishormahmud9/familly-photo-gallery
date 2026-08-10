import "server-only";
import { PhotoRepository, PaginatedPhotos } from "@/repositories/photoRepository";
import { AlbumRepository } from "@/repositories/albumRepository";
import { CloudinaryStorage } from "@/lib/storage/cloudinary";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { PhotoQueryInput, UpdatePhotoInput, BulkDeletePhotosInput, BulkMovePhotosInput } from "@/lib/validators/photo";
import { Photo } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface BulkOperationResult {
  successfulIds: string[];
  failed: Array<{ id: string; reason: string }>;
}

export class PhotoBackendService {
  static async getPhotos(query: PhotoQueryInput): Promise<PaginatedPhotos> {
    if (query.albumId) {
      const album = await prisma.album.findUnique({ where: { id: query.albumId } });
      if (!album) {
        throw new NotFoundError("Album not found");
      }
    }
    return PhotoRepository.findPaginated(query);
  }

  static async getPhotoById(id: string): Promise<Photo> {
    const photo = await PhotoRepository.findById(id);
    if (!photo) {
      throw new NotFoundError("Photo not found");
    }
    return photo;
  }

  static async updatePhoto(id: string, input: UpdatePhotoInput): Promise<Photo> {
    const photo = await PhotoRepository.findById(id);
    if (!photo) {
      throw new NotFoundError("Photo not found");
    }

    if (input.albumId) {
      const album = await prisma.album.findUnique({ where: { id: input.albumId } });
      if (!album) {
        throw new NotFoundError("Target album not found");
      }
    }

    return PhotoRepository.update(id, input);
  }

  static async deletePhoto(id: string): Promise<void> {
    const photo = await PhotoRepository.findById(id);
    if (!photo) {
      throw new NotFoundError("Photo not found");
    }

    // Delete Cloudinary asset if public ID is recorded
    if (photo.cloudinaryPublicId) {
      await CloudinaryStorage.deleteImage(photo.cloudinaryPublicId);
    }

    // Delete database record
    await PhotoRepository.delete(id);
  }

  static async bulkDeletePhotos(input: BulkDeletePhotosInput): Promise<BulkOperationResult> {
    const photos = await PhotoRepository.findByIds(input.photoIds);
    const successfulIds: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const photo of photos) {
      try {
        if (photo.cloudinaryPublicId) {
          await CloudinaryStorage.deleteImage(photo.cloudinaryPublicId);
        }
        await PhotoRepository.delete(photo.id);
        successfulIds.push(photo.id);
      } catch (err: unknown) {
        failed.push({
          id: photo.id,
          reason: err instanceof Error ? err.message : "Deletion failed",
        });
      }
    }

    return { successfulIds, failed };
  }

  static async bulkMovePhotos(input: BulkMovePhotosInput): Promise<{ count: number }> {
    const targetAlbum = await prisma.album.findUnique({ where: { id: input.albumId } });
    if (!targetAlbum) {
      throw new NotFoundError("Target album not found");
    }

    if (!input.photoIds || input.photoIds.length === 0) {
      throw new ValidationError("No photo IDs provided for relocation");
    }

    const result = await PhotoRepository.moveManyToAlbum(input.photoIds, input.albumId);
    return { count: result.count };
  }
}
