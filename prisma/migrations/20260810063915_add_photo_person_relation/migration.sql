-- CreateTable
CREATE TABLE "photo_people" (
    "photoId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "photo_people_pkey" PRIMARY KEY ("photoId","personId")
);

-- AddForeignKey
ALTER TABLE "photo_people" ADD CONSTRAINT "photo_people_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_people" ADD CONSTRAINT "photo_people_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
