/*
  Warnings:

  - A unique constraint covering the columns `[codigoAcceso]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigoAcceso` to the `Usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `codigoAcceso` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuarios_codigoAcceso_key` ON `Usuarios`(`codigoAcceso`);
