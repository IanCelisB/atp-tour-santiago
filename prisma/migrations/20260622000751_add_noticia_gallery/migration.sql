-- CreateTable
CREATE TABLE "Noticia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "autor" TEXT NOT NULL DEFAULT 'Redacción',
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "fechaPublicacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT,
    "descripcion" TEXT,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'FOTO',
    "thumbnailUrl" TEXT,
    "embedUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Noticia_slug_key" ON "Noticia"("slug");

-- CreateIndex
CREATE INDEX "Noticia_fechaPublicacion_idx" ON "Noticia"("fechaPublicacion");

-- CreateIndex
CREATE INDEX "Noticia_destacado_idx" ON "Noticia"("destacado");

-- CreateIndex
CREATE INDEX "GalleryItem_tipo_idx" ON "GalleryItem"("tipo");

-- CreateIndex
CREATE INDEX "GalleryItem_createdAt_idx" ON "GalleryItem"("createdAt");
