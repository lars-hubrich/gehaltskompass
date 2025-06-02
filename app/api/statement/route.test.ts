import { NextRequest } from "next/server";
import { GET, POST } from "./route";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    statement: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

describe("Statement API (Root)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/statement", () => {
    it("sollte eine Liste von Statements zurückliefern", async () => {
      const mockStatements = [
        {
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
        },
      ];

      (prisma.statement.findMany as jest.Mock).mockResolvedValue(
        mockStatements,
      );

      const request = {} as NextRequest;
      const response = await GET(request);

      expect(prisma.statement.findMany).toHaveBeenCalledWith({
        include: { incomes: true },
        orderBy: { year: "desc", month: "desc" },
      });

      const body = await response.json();
      expect(body).toEqual(mockStatements);
    });

    it("sollte 500 zurückgeben, wenn prisma.findMany wirft", async () => {
      (prisma.statement.findMany as jest.Mock).mockRejectedValue(
        new Error("DB-Fehler"),
      );

      const request = {} as NextRequest;
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Could not fetch statements." });
    });
  });

  describe("POST /api/statement", () => {
    it("sollte ein neues Statement mit Incomes anlegen und 201 zurückgeben", async () => {
      // Request-Body
      const createBody = {
        id: "stmt2",
        month: 6,
        year: 2025,
        brutto_tax: 1200,
        brutto_av: 250,
        brutto_pv: 180,
        brutto_rv: 270,
        brutto_kv: 110,
        deduction_tax_income: 60,
        deduction_tax_church: 12,
        deduction_tax_solidarity: 6,
        deduction_tax_other: 3,
        social_av: 22,
        social_pv: 18,
        social_rv: 27,
        social_kv: 11,
        payout_netto: 900,
        payout_transfer: 120,
        payout_vwl: 60,
        payout_other: 35,
        incomes: [
          { name: "Freelance", identifier: "FREEL1", value: 600 },
          { name: "Bonus", identifier: "BONUS1", value: 300 },
        ],
      };

      // Mocked Response von prisma.create
      const mockCreated = {
        id: "stmt2",
        ...createBody,
        incomes: [
          {
            id: "inc2",
            name: "Freelance",
            identifier: "FREEL1",
            value: 600,
            statementId: "stmt2",
          },
          {
            id: "inc3",
            name: "Bonus",
            identifier: "BONUS1",
            value: 300,
            statementId: "stmt2",
          },
        ],
      };
      (prisma.statement.create as jest.Mock).mockResolvedValue(mockCreated);

      // Fake NextRequest mit json()-Methode
      const request = {
        json: jest.fn().mockResolvedValue(createBody),
      } as unknown as NextRequest;

      const response = await POST(request);
      expect(prisma.statement.create).toHaveBeenCalledWith({
        data: {
          id: createBody.id,
          month: createBody.month,
          year: createBody.year,
          brutto_tax: createBody.brutto_tax,
          brutto_av: createBody.brutto_av,
          brutto_pv: createBody.brutto_pv,
          brutto_rv: createBody.brutto_rv,
          brutto_kv: createBody.brutto_kv,
          deduction_tax_income: createBody.deduction_tax_income,
          deduction_tax_church: createBody.deduction_tax_church,
          deduction_tax_solidarity: createBody.deduction_tax_solidarity,
          deduction_tax_other: createBody.deduction_tax_other,
          social_av: createBody.social_av,
          social_pv: createBody.social_pv,
          social_rv: createBody.social_rv,
          social_kv: createBody.social_kv,
          payout_netto: createBody.payout_netto,
          payout_transfer: createBody.payout_transfer,
          payout_vwl: createBody.payout_vwl,
          payout_other: createBody.payout_other,
          incomes: {
            create: createBody.incomes.map((inc) => ({
              name: inc.name,
              identifier: inc.identifier,
              value: inc.value,
            })),
          },
        },
        include: { incomes: true },
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual(mockCreated);
    });

    it("sollte 500 zurückgeben, wenn prisma.create scheitert", async () => {
      (prisma.statement.create as jest.Mock).mockRejectedValue(
        new Error("DB-Fehler"),
      );

      const createBody = {
        id: "stmt3",
        month: 7,
        year: 2025,
        brutto_tax: 1300,
        brutto_av: 260,
        brutto_pv: 185,
        brutto_rv: 275,
        brutto_kv: 115,
        deduction_tax_income: 65,
        deduction_tax_church: 13,
        deduction_tax_solidarity: 7,
        deduction_tax_other: 4,
        social_av: 23,
        social_pv: 19,
        social_rv: 28,
        social_kv: 12,
        payout_netto: 950,
        payout_transfer: 130,
        payout_vwl: 65,
        payout_other: 40,
        incomes: [],
      };

      const request = {
        json: jest.fn().mockResolvedValue(createBody),
      } as unknown as NextRequest;

      const response = await POST(request);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Could not create statement." });
    });
  });
});
