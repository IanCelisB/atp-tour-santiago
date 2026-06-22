-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campeonato" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    "sede" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PROGRAMADO',
    "ganadorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campeonato_ganadorId_fkey" FOREIGN KEY ("ganadorId") REFERENCES "Jugador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Campeonato" ("categoria", "createdAt", "estado", "fechaFin", "fechaInicio", "id", "nombre", "sede", "slug", "updatedAt") SELECT "categoria", "createdAt", "estado", "fechaFin", "fechaInicio", "id", "nombre", "sede", "slug", "updatedAt" FROM "Campeonato";
DROP TABLE "Campeonato";
ALTER TABLE "new_Campeonato" RENAME TO "Campeonato";
CREATE UNIQUE INDEX "Campeonato_slug_key" ON "Campeonato"("slug");
CREATE INDEX "Campeonato_estado_idx" ON "Campeonato"("estado");
CREATE INDEX "Campeonato_fechaInicio_idx" ON "Campeonato"("fechaInicio");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
