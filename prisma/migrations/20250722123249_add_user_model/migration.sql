/*
  Warnings:

  - You are about to drop the column `partNumber` on the `productos` table. All the data in the column will be lost.
  - Added the required column `direccionId` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precioUnitario` to the `PedidoItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `PedidoItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Productos_partNumber_key` ON `productos`;

-- AlterTable
ALTER TABLE `pedido` ADD COLUMN `direccionId` INTEGER NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `pedidoitem` ADD COLUMN `precioUnitario` DOUBLE NOT NULL,
    ADD COLUMN `subtotal` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `productos` DROP COLUMN `partNumber`;

-- CreateTable
CREATE TABLE `Direccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `calle` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `ciudad` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `pais` VARCHAR(191) NOT NULL,
    `cp` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_direccionId_fkey` FOREIGN KEY (`direccionId`) REFERENCES `Direccion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Direccion` ADD CONSTRAINT `Direccion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
