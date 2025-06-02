import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "./route";

// Prisma-Client mocken
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    statement: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

describe("Statement API [id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Hilfsfunktion, um params-Objekt zu erzeugen
  const createParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  describe("GET /api/statement/[id]", () => {
    it("sollte ein Statement zurückliefern, wenn es existiert", async () => {
      const mockStatement = {
        id: "stmt1",
        month: 5,
        year: 2025,
        brutto_tax: 1000,
        brutto_av: 200,
        brutto_pv: 150,
        brutto_rv: 250,
        brutto_kv: 100,
        deduction_tax_income: 50,
        deduction_tax_church: 10,
        deduction_tax_solidarity: 5,
        deduction_tax_other: 2,
        social_av: 20,
        social_pv: 15,
        social_rv: 25,
        social_kv: 10,
        payout_netto: 800,
        payout_transfer: 100,
        payout_vwl: 50,
        payout_other: 30,
        incomes: [
          {
            id: "inc1",
            name: "Nebentätigkeit",
            identifier: "NEBEN1",
            value: 500,
            statementId: "stmt1",
          },
        ],
      };

      (prisma.statement.findUnique as jest.Mock).mockResolvedValue(
        mockStatement,
      );

      const request = {} as NextRequest;
      const params = createParams("stmt1");

      const response = await GET(request, params);

      expect(prisma.statement.findUnique).toHaveBeenCalledWith({
        where: { id: "stmt1" },
        include: { incomes: true },
      });

      expect(response.status).toBeUndefined(); // NextResponse.json setzt keinen expliziten Status (default 200)
      const body = await response.json();
      expect(body).toEqual(mockStatement);
    });

    it("sollte 404 zurückgeben, wenn Statement nicht existiert", async () => {
      (prisma.statement.findUnique as jest.Mock).mockResolvedValue(null);

      const request = {} as NextRequest;
      const params = createParams("nonexistent");

      const response = await GET(request, params);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body).toEqual({ error: "Not Found" });
    });

    it("sollte 500 zurückgeben, wenn prisma.findUnique wirft", async () => {
      (prisma.statement.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB-Fehler"),
      );

      const request = {} as NextRequest;
      const params = createParams("stmtError");

      const response = await GET(request, params);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body).toEqual({ error: "Could not fetch statement." });
    });
  });

  describe("PATCH /api/statement/[id]", () => {
    it("sollte ein vorhandenes Statement updaten und zurückgeben", async () => {
      const updateBody = {
        month: 6,
        payout_netto: 850,
      };
      const existingStatement = { id: "stmt1" };
      const updatedStatement = {
        id: "stmt1",
        month: 6,
        year: 2025,
        brutto_tax: 1000,
        brutto_av: 200,
        brutto_pv: 150,
        brutto_rv: 250,
        brutto_kv: 100,
        deduction_tax_income: 50,
        deduction_tax_church: 10,
        deduction_tax_solidarity: 5,
        deduction_tax_other: 2,
        social_av: 20,
        social_pv: 15,
        social_rv: 25,
        social_kv: 10,
        payout_netto: 850,
        payout_transfer: 100,
        payout_vwl: 50,
        payout_other: 30,
        incomes: [],
      };

      (prisma.statement.findUnique as jest.Mock).mockResolvedValue(
        existingStatement,
      );
      (prisma.statement.update as jest.Mock).mockResolvedValue(
        updatedStatement,
      );

      const request = {
        json: jest.fn().mockResolvedValue(updateBody),
      } as unknown as NextRequest;
      const params = createParams("stmt1");

      const response = await PATCH(request, params);

      expect(prisma.statement.findUnique).toHaveBeenCalledWith({
        where: { id: "stmt1" },
      });
      expect(prisma.statement.update).toHaveBeenCalledWith({
        where: { id: "stmt1" },
        data: {
          month: 6,
          payout_netto: 850,
        },
        include: { incomes: true },
      });

      const body = await response.json();
      expect(body).toEqual(updatedStatement);
    });

    it("sollte PATCH mit neuem Incomes-Array handhaben", async () => {
      const updateBody = {
        incomes: [{ name: "Zuschuss", identifier: "ZUS1", value: 400 }],
      };
      const existingStatement = { id: "stmt2" };
      const updatedStatement = {
        id: "stmt2",
        month: 5,
        year: 2025,
        brutto_tax: 1100,
        brutto_av: 210,
        brutto_pv: 160,
        brutto_rv: 260,
        brutto_kv: 105,
        deduction_tax_income: 55,
        deduction_tax_church: 11,
        deduction_tax_solidarity: 6,
        deduction_tax_other: 3,
        social_av: 21,
        social_pv: 16,
        social_rv: 26,
        social_kv: 11,
        payout_netto: 820,
        payout_transfer: 110,
        payout_vwl: 55,
        payout_other: 32,
        incomes: [
          {
            id: "incZ1",
            name: "Zuschuss",
            identifier: "ZUS1",
            value: 400,
            statementId: "stmt2",
          },
        ],
      };

      (prisma.statement.findUnique as jest.Mock).mockResolvedValue(
        existingStatement,
      );
      (prisma.statement.update as jest.Mock).mockResolvedValue(
        updatedStatement,
      );

      const request = {
        json: jest.fn().mockResolvedValue(updateBody),
      } as unknown as NextRequest;
      const params = createParams("stmt2");

      const response = await PATCH(request, params);

      expect(prisma.statement.findUnique).toHaveBeenCalledWith({
        where: { id: "stmt2" },
      });
      expect(prisma.statement.update).toHaveBeenCalledWith({
        where: { id: "stmt2" },
        data: {
          incomes: {
            deleteMany: {},
            create: [
              {
                name: "Zuschuss",
                identifier: "ZUS1",
                value: 400,
              },
            ],
          },
        },
        include: { incomes: true },
      });

      const body = await response.json();
      expect(body).toEqual(updatedStatement);
    });

    it("sollte 404 zurückgeben, wenn das Statement nicht existiert", async () => {
      (prisma.statement.findUnique as jest.Mock).mockResolvedValue(null);

      const request = {
        json: jest.fn().mockResolvedValue({ month: 7 }),
      } as unknown as NextRequest;
      const params = createParams("nonexistent");

      const response = await PATCH(request, params);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body).toEqual({ error: "Not Found" });
    });

    it("sollte 500 zurückgeben, wenn prisma.update scheitert", async () => {
      (prisma.statement.findUnique as jest.Mock).mockResolvedValue({
        id: "errStmt",
      });
      (prisma.statement.update as jest.Mock).mockRejectedValue(
        new Error("DB-Fehler"),
      );

      const request = {
        json: jest.fn().mockResolvedValue({ payout_netto: 900 }),
      } as unknown as NextRequest;
      const params = createParams("errStmt");

      const response = await PATCH(request, params);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body).toEqual({ error: "Could not update statement." });
    });
  });

  describe("DELETE /api/statement/[id]", () => {
    it("sollte ein vorhandenes Statement löschen und 204 zurückgeben", async () => {
      (prisma.statement.findUnique as jest.Mock).mockResolvedValue({
        id: "stmtDel",
      });
      (prisma.statement.delete as jest.Mock).mockResolvedValue(undefined);

      const request = {} as NextRequest;
      const params = createParams("stmtDel");

      const response = await DELETE(request, params);

      expect(prisma.statement.findUnique).toHaveBeenCalledWith({
        where: { id: "stmtDel" },
      });
      expect(prisma.statement.delete).toHaveBeenCalledWith({
        where: { id: "stmtDel" },
      });

      expect(response.status).toBe(204);
      // Bei 204 ist der Body leer – response.text() sollte ""
      const text = await response.text();
      expect(text).toBe("");
    });

    it("sollte 404 zurückgeben, wenn das Statement nicht existiert", async () => {
      (prisma.statement.findUnique as jest.Mock).mockResolvedValue(null);

      const request = {} as NextRequest;
      const params = createParams("nichtDa");

      const response = await DELETE(request, params);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body).toEqual({ error: "Not Found" });
    });

    it("sollte 500 zurückgeben, wenn prisma.delete scheitert", async () => {
      (prisma.statement.findUnique as jest.Mock).mockResolvedValue({
        id: "stmtErr",
      });
      (prisma.statement.delete as jest.Mock).mockRejectedValue(
        new Error("DB-Fehler"),
      );

      const request = {} as NextRequest;
      const params = createParams("stmtErr");

      const response = await DELETE(request, params);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body).toEqual({ error: "Could not delete statement." });
    });
  });
});
