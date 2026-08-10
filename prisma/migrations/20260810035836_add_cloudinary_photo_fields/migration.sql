-- AlterTable
ALTER TABLE "photos" ADD COLUMN     "cloudinaryPublicId" TEXT,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER;
