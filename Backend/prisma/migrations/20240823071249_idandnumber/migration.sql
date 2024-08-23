/*
  Warnings:

  - You are about to drop the column `subject` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blankCount` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctCount` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idNumber` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "subject",
ADD COLUMN     "blankCount" INTEGER NOT NULL,
ADD COLUMN     "correctCount" INTEGER NOT NULL,
ADD COLUMN     "idNumber" INTEGER NOT NULL,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_idNumber_key" ON "Student"("idNumber");
