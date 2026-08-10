import "server-only";
import { AlbumRepository, AlbumWithPhotoCount } from "@/repositories/albumRepository";
import { CreateAlbumInput, UpdateAlbumInput } from "@/lib/validators/album";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";

export interface FormattedAlbumResponse {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
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
    if (!album) {
      throw new NotFoundError("Album not found");
    }
    return formatAlbumResponse(album);
  }

  static async createAlbum(input: CreateAlbumInput): Promise<FormattedAlbumResponse> {
    const album = await AlbumRepository.create(input);
    return formatAlbumResponse(album);
  }

  static async updateAlbum(id: string, input: UpdateAlbumInput): Promise<FormattedAlbumResponse> {
    const existing = await AlbumRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Album not found");
    }

    const updated = await AlbumRepository.update(id, input);
    return formatAlbumResponse(updated);
  }

  static async deleteAlbum(id: string): Promise<void> {
    const album = await AlbumRepository.findById(id);
    if (!album) {
      throw new NotFoundError("Album not found");
    }

    const photoCount = await AlbumRepository.countPhotos(id);
    if (photoCount > 0) {
      throw new ConflictError("Cannot delete an album that contains photos. Remove or move the photos first.");
    }

    await AlbumRepository.delete(id);
  }
}
