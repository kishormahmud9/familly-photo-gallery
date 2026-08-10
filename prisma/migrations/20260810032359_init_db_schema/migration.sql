-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "eventDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "filename" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_email_idx" ON "admins"("email");

-- CreateIndex
CREATE INDEX "albums_createdAt_idx" ON "albums"("createdAt");

-- CreateIndex
CREATE INDEX "photos_albumId_idx" ON "photos"("albumId");

-- CreateIndex
CREATE INDEX "photos_createdAt_idx" ON "photos"("createdAt");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
