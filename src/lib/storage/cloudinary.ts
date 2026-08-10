import "server-only";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  format: string;
}

export class CloudinaryStorage {
  static isConfigured(): boolean {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  static async uploadBuffer(
    buffer: Buffer,
    albumId: string
  ): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new Error("Cloudinary credentials are not configured in environment variables");
    }

    const envFolder = process.env.NODE_ENV === "production" ? "production" : "development";
    const folderPath = `family-photo-gallery/${envFolder}/albums/${albumId}/photos`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: "image",
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed with empty response"));
          }

          // Generate thumbnail transformation URL (c_fill, w_400, h_400, g_auto)
          const thumbUrl = cloudinary.url(result.public_id, {
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "auto" },
              { fetch_format: "auto", quality: "auto" },
            ],
            secure: true,
          });

          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            thumbUrl,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isConfigured() || !publicId) return false;

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error(`❌ Failed to delete Cloudinary asset ${publicId}:`, error);
      return false;
    }
  }
}
