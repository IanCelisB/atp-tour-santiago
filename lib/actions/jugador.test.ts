import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  createJugadorAction,
  deleteJugadorAction,
  updateJugadorAction,
} from "./jugador";
import {
  getTestPrisma,
  setupJugadorCleanup,
  teardownJugadorClient,
} from "@/lib/test-utils/test-db";

/**
 * Jugador CRUD action tests.
 *
 * Tests run against `prisma/test.db` (gitignored). Each test starts with an
 * empty `jugador` table; the helper `setupJugadorCleanup()` registers
 * `beforeEach` to wipe rows and `afterAll` to disconnect the client.
 */

const VALID_BASE = {
  nombre: "Nicolas",
  apellido: "Jarry",
  pais: "CL",
  ranking: 42,
  bio: "Chilean tennis pro",
  resistencia: 80,
  velocidad: 75,
  derecho: 90,
  reves: 70,
  estatura: 198,
  poder: 85,
};

function prisma(): PrismaClient {
  return getTestPrisma();
}

describe("lib/actions/jugador", () => {
  setupJugadorCleanup();
  teardownJugadorClient();

  describe("createJugadorAction", () => {
    it("creates a new Jugador row with valid input", async () => {
      const result = await createJugadorAction(prisma(), VALID_BASE);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeTruthy();
      expect(result.data?.nombre).toBe("Nicolas");
      expect(result.data?.resistencia).toBe(80);
      expect(result.data?.velocidad).toBe(75);
      expect(result.data?.derecho).toBe(90);
      expect(result.data?.reves).toBe(70);
      expect(result.data?.estatura).toBe(198);
      expect(result.data?.poder).toBe(85);

      // Row actually persisted to the DB
      const row = await prisma().jugador.findUnique({
        where: { id: result.data!.id },
      });
      expect(row?.nombre).toBe("Nicolas");
      expect(row?.resistencia).toBe(80);
    });

    it("defaults stats when omitted", async () => {
      const result = await createJugadorAction(prisma(), {
        nombre: "Alejandro",
        apellido: "Tabilo",
        pais: "CL",
      });
      expect(result.success).toBe(true);
      expect(result.data?.resistencia).toBe(50);
      expect(result.data?.velocidad).toBe(50);
      expect(result.data?.estatura).toBe(170);
    });

    it("returns an error when required fields are missing", async () => {
      const result = await createJugadorAction(prisma(), {
        nombre: "",
        apellido: "Jarry",
        pais: "CL",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("returns an error when stat values are out of range", async () => {
      const result = await createJugadorAction(prisma(), {
        ...VALID_BASE,
        resistencia: 150,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateJugadorAction", () => {
    it("updates an existing Jugador", async () => {
      const created = await createJugadorAction(prisma(), VALID_BASE);
      expect(created.success).toBe(true);

      const updated = await updateJugadorAction(prisma(), created.data!.id, {
        nombre: "Nicolas",
        apellido: "Jarry",
        pais: "CL",
        ranking: 30,
        resistencia: 95,
        velocidad: 80,
      });
      expect(updated.success).toBe(true);
      expect(updated.data?.ranking).toBe(30);
      expect(updated.data?.resistencia).toBe(95);

      // Re-read from DB
      const row = await prisma().jugador.findUnique({
        where: { id: created.data!.id },
      });
      expect(row?.ranking).toBe(30);
      expect(row?.resistencia).toBe(95);
    });

    it("returns an error when the target id does not exist", async () => {
      const updated = await updateJugadorAction(prisma(), "no-such-id", {
        nombre: "Ghost",
        apellido: "Player",
        pais: "XX",
      });
      expect(updated.success).toBe(false);
    });
  });

  describe("deleteJugadorAction", () => {
    it("deletes the targeted Jugador and removes the row", async () => {
      const created = await createJugadorAction(prisma(), VALID_BASE);
      expect(created.success).toBe(true);

      const deleted = await deleteJugadorAction(prisma(), created.data!.id);
      expect(deleted.success).toBe(true);

      const row = await prisma().jugador.findUnique({
        where: { id: created.data!.id },
      });
      expect(row).toBeNull();
    });

    it("returns an error when the target id does not exist", async () => {
      const result = await deleteJugadorAction(prisma(), "no-such-id");
      expect(result.success).toBe(false);
    });
  });
});
