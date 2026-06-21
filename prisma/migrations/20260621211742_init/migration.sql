-- CreateTable
CREATE TABLE "Campeonato" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    "sede" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PROGRAMADO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Jugador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "ranking" INTEGER,
    "bio" TEXT,
    "fotoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campeonatoId" TEXT NOT NULL,
    "jugador1Id" TEXT NOT NULL,
    "jugador2Id" TEXT NOT NULL,
    "ganadorId" TEXT,
    "marcador" TEXT,
    "bracketPosition" INTEGER NOT NULL,
    "ronda" TEXT NOT NULL,
    "fecha" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Partido_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Partido_jugador1Id_fkey" FOREIGN KEY ("jugador1Id") REFERENCES "Jugador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partido_jugador2Id_fkey" FOREIGN KEY ("jugador2Id") REFERENCES "Jugador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partido_ganadorId_fkey" FOREIGN KEY ("ganadorId") REFERENCES "Jugador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "jugadorId" TEXT,
    "partidoId" TEXT,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Foto_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foto_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "Partido" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Campeonato_slug_key" ON "Campeonato"("slug");

-- CreateIndex
CREATE INDEX "Campeonato_estado_idx" ON "Campeonato"("estado");

-- CreateIndex
CREATE INDEX "Campeonato_fechaInicio_idx" ON "Campeonato"("fechaInicio");

-- CreateIndex
CREATE INDEX "Jugador_pais_idx" ON "Jugador"("pais");

-- CreateIndex
CREATE INDEX "Jugador_ranking_idx" ON "Jugador"("ranking");

-- CreateIndex
CREATE INDEX "Partido_campeonatoId_ronda_idx" ON "Partido"("campeonatoId", "ronda");

-- CreateIndex
CREATE INDEX "Partido_fecha_idx" ON "Partido"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Partido_campeonatoId_bracketPosition_key" ON "Partido"("campeonatoId", "bracketPosition");

-- CreateIndex
CREATE INDEX "Foto_jugadorId_idx" ON "Foto"("jugadorId");

-- CreateIndex
CREATE INDEX "Foto_partidoId_idx" ON "Foto"("partidoId");

-- CreateIndex
CREATE INDEX "Foto_context_idx" ON "Foto"("context");
