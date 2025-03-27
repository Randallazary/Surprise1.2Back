/*
  Warnings:

  - You are about to alter the column `content` on the `DeslindeDeResponsabilidad` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Text`.
  - You are about to alter the column `content` on the `PoliticasDePrivacidad` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Text`.
  - You are about to alter the column `content` on the `TerminosYCondiciones` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Text`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[DeslindeDeResponsabilidad] ALTER COLUMN [content] TEXT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PoliticasDePrivacidad] ALTER COLUMN [content] TEXT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[TerminosYCondiciones] ALTER COLUMN [content] TEXT NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
