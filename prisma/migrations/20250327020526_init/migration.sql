BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Usuarios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [lastname] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [telefono] NVARCHAR(1000) NOT NULL,
    [user] NVARCHAR(1000) NOT NULL,
    [preguntaSecreta] NVARCHAR(1000) NOT NULL,
    [respuestaSecreta] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [verified] BIT NOT NULL CONSTRAINT [Usuarios_verified_df] DEFAULT 0,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [Usuarios_role_df] DEFAULT 'normal',
    [failedLoginAttempts] INT NOT NULL CONSTRAINT [Usuarios_failedLoginAttempts_df] DEFAULT 0,
    [lockedUntil] DATETIME2,
    [blocked] BIT NOT NULL CONSTRAINT [Usuarios_blocked_df] DEFAULT 0,
    [lockCount] INT NOT NULL CONSTRAINT [Usuarios_lockCount_df] DEFAULT 0,
    [lastLogin] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Usuarios_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Usuarios_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Usuarios_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[LoginHistory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [loginDate] DATETIME2 NOT NULL CONSTRAINT [LoginHistory_loginDate_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] INT NOT NULL,
    CONSTRAINT [LoginHistory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Productos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(500) NOT NULL,
    [price] FLOAT(53) NOT NULL CONSTRAINT [Productos_price_df] DEFAULT 0,
    [stock] INT NOT NULL CONSTRAINT [Productos_stock_df] DEFAULT 0,
    [category] NVARCHAR(1000) NOT NULL,
    [brand] NVARCHAR(1000) NOT NULL,
    [discount] FLOAT(53) CONSTRAINT [Productos_discount_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Productos_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Productos_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Imagenes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [url] NVARCHAR(1000) NOT NULL,
    [productId] INT NOT NULL,
    CONSTRAINT [Imagenes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Logos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [url] NVARCHAR(1000) NOT NULL,
    [fechaSubida] DATETIME2 NOT NULL CONSTRAINT [Logos_fechaSubida_df] DEFAULT CURRENT_TIMESTAMP,
    [autor] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Logos_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Logos_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TerminosYCondiciones] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [isCurrent] BIT NOT NULL CONSTRAINT [TerminosYCondiciones_isCurrent_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TerminosYCondiciones_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TerminosYCondiciones_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PoliticasDePrivacidad] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [isCurrent] BIT NOT NULL CONSTRAINT [PoliticasDePrivacidad_isCurrent_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PoliticasDePrivacidad_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PoliticasDePrivacidad_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DeslindeDeResponsabilidad] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [isCurrent] BIT NOT NULL CONSTRAINT [DeslindeDeResponsabilidad_isCurrent_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DeslindeDeResponsabilidad_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [DeslindeDeResponsabilidad_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[LoginHistory] ADD CONSTRAINT [LoginHistory_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Usuarios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Imagenes] ADD CONSTRAINT [Imagenes_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[Productos]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
