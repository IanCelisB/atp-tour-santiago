-- Migrate existing data to Spanish status names
UPDATE "Partido" SET "status" = 'PROGRAMADO' WHERE "status" = 'SCHEDULED';
UPDATE "Partido" SET "status" = 'EN_CURSO' WHERE "status" = 'IN_PROGRESS';
UPDATE "Partido" SET "status" = 'FINALIZADO' WHERE "status" = 'COMPLETED';
UPDATE "Partido" SET "status" = 'CANCELADO' WHERE "status" = 'CANCELLED';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Partido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campeonatoId" TEXT NOT NULL,
    "jugador1Id" TEXT NOT NULL,
    "jugador2Id" TEXT NOT NULL,
    "ganadorId" TEXT,
    "marcador" TEXT,
    "bracketPosition" INTEGER NOT NULL,
    "ronda" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROGRAMADO',
    "fecha" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Partido_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Partido_jugador1Id_fkey" FOREIGN KEY ("jugador1Id") REFERENCES "Jugador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partido_jugador2Id_fkey" FOREIGN KEY ("jugador2Id") REFERENCES "Jugador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partido_ganadorId_fkey" FOREIGN KEY ("ganadorId") REFERENCES "Jugador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Partido" ("bracketPosition", "campeonatoId", "createdAt", "fecha", "ganadorId", "id", "jugador1Id", "jugador2Id", "marcador", "ronda", "status", "updatedAt") SELECT "bracketPosition", "campeonatoId", "createdAt", "fecha", "ganadorId", "id", "jugador1Id", "jugador2Id", "marcador", "ronda", "status", "updatedAt" FROM "Partido";
DROP TABLE "Partido";
ALTER TABLE "new_Partido" RENAME TO "Partido";
CREATE INDEX "Partido_campeonatoId_ronda_idx" ON "Partido"("campeonatoId", "ronda");
CREATE INDEX "Partido_fecha_idx" ON "Partido"("fecha");
CREATE UNIQUE INDEX "Partido_campeonatoId_bracketPosition_key" ON "Partido"("campeonatoId", "bracketPosition");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
