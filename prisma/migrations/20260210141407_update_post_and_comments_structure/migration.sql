/*
  Warnings:

  - You are about to drop the column `mediaId` on the `Post` table. All the data in the column will be lost.
  - Added the required column `editTimestamp` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `editTimestamp` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_mediaId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "editTimestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "emitterId" INTEGER,
ADD COLUMN     "postTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "mediaId",
ADD COLUMN     "editTimestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "postTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "PostMedia" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostMedia_postId_mediaId_key" ON "PostMedia"("postId", "mediaId");

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_emitterId_fkey" FOREIGN KEY ("emitterId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
