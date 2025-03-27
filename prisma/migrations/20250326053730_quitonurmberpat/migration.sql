/*
  Warnings:

  - You are about to drop the column `partNumber` on the `Productos` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Productos] DROP CONSTRAINT [Productos_partNumber_key];

-- AlterTable
ALTER TABLE [dbo].[Productos] DROP COLUMN [partNumber];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
