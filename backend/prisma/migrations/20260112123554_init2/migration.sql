/*
  Warnings:

  - You are about to drop the column `Authentication` on the `APIRequest` table. All the data in the column will be lost.
  - You are about to drop the column `Body` on the `APIRequest` table. All the data in the column will be lost.
  - You are about to drop the column `Headers` on the `APIRequest` table. All the data in the column will be lost.
  - You are about to drop the column `Response` on the `APIRequest` table. All the data in the column will be lost.
  - You are about to drop the column `endpoint` on the `APIRequest` table. All the data in the column will be lost.
  - Added the required column `name` to the `APIRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `APIRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "APIRequest" DROP COLUMN "Authentication",
DROP COLUMN "Body",
DROP COLUMN "Headers",
DROP COLUMN "Response",
DROP COLUMN "endpoint",
ADD COLUMN     "authentication" JSONB,
ADD COLUMN     "body" JSONB,
ADD COLUMN     "headers" JSONB,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "response" JSONB,
ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "statusCode" DROP NOT NULL;
