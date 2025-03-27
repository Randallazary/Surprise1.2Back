/*
  Warnings:

  - You are about to drop the `Compatibilidad` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Compatibilidad] DROP CONSTRAINT [Compatibilidad_productId_fkey];

-- DropTable
DROP TABLE [dbo].[Compatibilidad];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
