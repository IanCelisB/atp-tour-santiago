-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Jugador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "ranking" INTEGER,
    "bio" TEXT,
    "fotoUrl" TEXT,
    "resistencia" INTEGER NOT NULL DEFAULT 50,
    "velocidad" INTEGER NOT NULL DEFAULT 50,
    "derecho" INTEGER NOT NULL DEFAULT 50,
    "reves" INTEGER NOT NULL DEFAULT 50,
    "estatura" INTEGER NOT NULL DEFAULT 170,
    "poder" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Jugador" ("apellido", "bio", "createdAt", "fotoUrl", "id", "nombre", "pais", "ranking", "updatedAt") SELECT "apellido", "bio", "createdAt", "fotoUrl", "id", "nombre", "pais", "ranking", "updatedAt" FROM "Jugador";
DROP TABLE "Jugador";
ALTER TABLE "new_Jugador" RENAME TO "Jugador";
CREATE INDEX "Jugador_pais_idx" ON "Jugador"("pais");
CREATE INDEX "Jugador_ranking_idx" ON "Jugador"("ranking");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
