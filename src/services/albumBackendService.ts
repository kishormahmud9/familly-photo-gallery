import "server-only";
import { AlbumRepository, AlbumWithPhotoCount } from "@/repositories/albumRepository";
import { CreateAlbumInput, UpdateAlbumInput } from "@/lib/validators/album";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";
import { CloudinaryStorage } from "@/lib/storage/cloudinary";

export interface FormattedAlbumResponse {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  cloudinaryPublicId: string | null;
  eventDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  photoCount: number;
}

function formatAlbumResponse(album: AlbumWithPhotoCount): FormattedAlbumResponse {
  const { _count, ...rest } = album;
  return {
    ...rest,
    photoCount: _count.photos,
  };
}

export class AlbumService {
  static async getAlbums(): Promise<FormattedAlbumResponse[]> {
    const albums = await AlbumRepository.findAll();
    return albums.map(formatAlbumResponse);
  }

  static async getAlbumById(id: string): Promise<FormattedAlbumResponse> {
    const album = await AlbumRepository.findById(id);
    if (!album) throw new NotFoundError("Album not found");
    return formatAlbumResponse(album);
  }

  static async createAlbum(input: CreateAlbumInput): Promise<FormattedAlbumResponse> {
    try {
      const album = await AlbumRepository.create(input);
      return formatAlbumResponse(album);
    } catch (err) {
      // If DB create fails and a Cloudinary asset was already uploaded, clean it up.
      if (input.cloudinaryPublicId) {
        await CloudinaryStorage.deleteImage(input.cloudinaryPublicId).catch((e) =>
          console.error("⚠️ Orphan Cloudinary cleanup failed:", e)
        );
      }
      throw err;
    }
  }

  static async updateAlbum(
    id: string,
    input: UpdateAlbumInput,
    oldPublicId?: string | null
  ): Promise<FormattedAlbumResponse> {
    const existing = await AlbumRepository.findById(id);
    if (!existing) throw new NotFoundError("Album not found");

    try {
      const updated = await AlbumRepository.update(id, input);

      // Only after successful DB update, delete the old Cloudinary cover.
      if (
        oldPublicId &&
        input.cloudinaryPublicId &&
        input.cloudinaryPublicId !== oldPublicId
      ) {
        await CloudinaryStorage.deleteImage(oldPublicId).catch((e) =>
          console.error("⚠️ Old cover Cloudinary cleanup failed:", e)
        );
      }

      return formatAlbumResponse(updated);
    } catch (err) {
      // DB update failed — delete the newly uploaded cover to prevent orphan.
      if (input.cloudinaryPublicId && input.cloudinaryPublicId !== oldPublicId) {
        await CloudinaryStorage.deleteImage(input.cloudinaryPublicId).catch((e) =>
          console.error("⚠️ New cover Cloudinary rollback failed:", e)
        );
      }
      throw err;
    }
  }

  static async deleteAlbum(id: string): Promise<void> {
    const album = await AlbumRepository.findById(id);
    if (!album) throw new NotFoundError("Album not found");

    const photoCount = await AlbumRepository.countPhotos(id);
    if (photoCount > 0) {
      throw new ConflictError(
        "Cannot delete an album that contains photos. Remove or move the photos first."
      );
    }

    const coverPublicId = album.cloudinaryPublicId;
    await AlbumRepository.delete(id);

    // Clean up Cloudinary cover after successful DB deletion.
    if (coverPublicId) {
      await CloudinaryStorage.deleteImage(coverPublicId).catch((e) =>
        console.error("⚠️ Deleted album cover Cloudinary cleanup failed:", e)
      );
    }
  }
}
