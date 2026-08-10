import "server-only";
import { prisma } from "@/lib/db/prisma";
import { CloudinaryStorage, CloudinaryUploadResult } from "@/lib/storage/cloudinary";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { Photo } from "@prisma/client";

export interface FileToUpload {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

export interface UploadSuccessItem {
  photoId: string;
  filename: string;
  imageUrl: string;
  thumbUrl: string | null;
  albumId: string;
}

export interface UploadFailedItem {
  filename: string;
  reason: string;
}

export interface MultiUploadResult {
  uploaded: UploadSuccessItem[];
  failed: UploadFailedItem[];
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit per photo
const MAX_FILES_PER_BATCH = 20;

export class PhotoUploadService {
  static async uploadPhotosForAlbum(
    albumId: string,
    files: FileToUpload[]
  ): Promise<MultiUploadResult> {
    // 1. Verify Album existence
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) {
      throw new NotFoundError("Target album not found");
    }

    if (!files || files.length === 0) {
      throw new ValidationError("No files provided for upload");
    }

    if (files.length > MAX_FILES_PER_BATCH) {
      throw new ValidationError(`Cannot upload more than ${MAX_FILES_PER_BATCH} files per request`);
    }

    const uploaded: UploadSuccessItem[] = [];
    const failed: UploadFailedItem[] = [];

    // 2. Process files sequentially to maintain safe concurrency
    for (const file of files) {
      // Validate file format
      if (!ALLOWED_MIME_TYPES.includes(file.mimeType.toLowerCase())) {
        failed.push({
          filename: file.filename,
          reason: "Unsupported file format. Allowed formats: JPG, PNG, WEBP",
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        failed.push({
          filename: file.filename,
          reason: "File size exceeds 10MB limit",
        });
        continue;
      }

      let cloudResult: CloudinaryUploadResult | null = null;
      let photoRecord: Photo | null = null;

      try {
        // Upload to Cloudinary
        cloudResult = await CloudinaryStorage.uploadBuffer(file.buffer, albumId);

        // Save Photo record in database
        photoRecord = await prisma.photo.create({
          data: {
            albumId,
            imageUrl: cloudResult.secureUrl,
            thumbUrl: cloudResult.thumbUrl,
            filename: file.filename,
            cloudinaryPublicId: cloudResult.publicId,
            width: cloudResult.width,
            height: cloudResult.height,
            format: cloudResult.format,
          },
        });

        uploaded.push({
          photoId: photoRecord.id,
          filename: photoRecord.filename,
          imageUrl: photoRecord.imageUrl,
          thumbUrl: photoRecord.thumbUrl,
          albumId: photoRecord.albumId,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Upload processing failed";

        // Cleanup Cloudinary asset if DB insert failed after Cloudinary upload
        if (cloudResult && !photoRecord) {
          console.warn(`⚠️ Cleaning up orphaned Cloudinary asset ${cloudResult.publicId} due to DB error...`);
          await CloudinaryStorage.deleteImage(cloudResult.publicId);
        }

        failed.push({
          filename: file.filename,
          reason: errorMsg,
        });
      }
    }

    return { uploaded, failed };
  }
}
