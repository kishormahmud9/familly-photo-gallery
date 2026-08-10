import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db/prisma";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError } from "@/lib/errors/app-error";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can view dashboard statistics");
    }

    const [totalAlbums, totalPhotos, recentPhotos, recentAlbums] = await Promise.all([
      prisma.album.count(),
      prisma.photo.count(),
      prisma.photo.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { album: { select: { title: true } } },
      }),
      prisma.album.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { photos: true } } },
      }),
    ]);

    return successResponse({
      stats: {
        totalAlbums,
        totalPhotos,
      },
      recentPhotos,
      recentAlbums,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
