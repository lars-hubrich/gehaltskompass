/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  statement: { create: jest.fn(), deleteMany: jest.fn() },
}));
jest.mock("@/lib/server-utils", () => ({
  requireAuthenticatedUser: jest.fn(),
  handleError: jest.fn(),
}));

import { POST } from "./route";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

const mockRequire = requireAuthenticatedUser as jest.Mock;
const mockHandleError = handleError as jest.Mock;

describe("/api/user/import", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleError.mockImplementation((e: unknown) =>
      NextResponse.json({ error: String(e) }, { status: 500 }),
    );
  });

  it("returns 401 if not authenticated", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const req = new Request("http://localhost/api/user/import", {
      method: "POST",
      body: JSON.stringify({ statements: [] }),
    });
    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("imports statements and ignores ids", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.create as jest.Mock).mockResolvedValueOnce({ id: "s1" });
    const req = new Request("http://localhost/api/user/import", {
      method: "POST",
      body: JSON.stringify({
        statements: [
          {
            id: "old",
            user_id: "uOld",
            month: 1,
            year: 2024,
            incomes: [
              {
                id: "i1",
                statement_id: "old",
                name: "n",
                identifier: "id",
                value: 5,
              },
            ],
          },
        ],
      }),
    });
    const res = await POST(req as unknown as NextRequest);
    expect(prisma.statement.deleteMany).toHaveBeenCalledWith({
      where: { user_id: "u1" },
    });
    expect(prisma.statement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: "u1",
        month: 1,
        year: 2024,
        incomes: { create: [{ name: "n", identifier: "id", value: 5 }] },
      }),
      include: { incomes: true },
    });
    expect(res.status).toBe(201);
  });

  it("imports statements from csv", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.create as jest.Mock).mockResolvedValueOnce({ id: "s1" });
    const csv =
      "year,month,brutto_tax,brutto_av,brutto_pv,brutto_rv,brutto_kv,deduction_tax_income,deduction_tax_church,deduction_tax_solidarity,deduction_tax_other,social_av,social_pv,social_rv,social_kv,payout_netto,payout_transfer,payout_vwl,payout_other,identifier,name,value\n" +
      "2024,1,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,id,n,5\n";
    const req = new Request("http://localhost/api/user/import?format=csv", {
      method: "POST",
      body: csv,
    });
    const res = await POST(req as unknown as NextRequest);
    expect(prisma.statement.deleteMany).toHaveBeenCalledWith({
      where: { user_id: "u1" },
    });
    expect(prisma.statement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: "u1",
        month: 1,
        year: 2024,
        brutto_tax: 1,
        brutto_av: 2,
        brutto_pv: 3,
        brutto_rv: 4,
        brutto_kv: 5,
        deduction_tax_income: 6,
        deduction_tax_church: 7,
        deduction_tax_solidarity: 8,
        deduction_tax_other: 9,
        social_av: 10,
        social_pv: 11,
        social_rv: 12,
        social_kv: 13,
        payout_netto: 14,
        payout_transfer: 15,
        payout_vwl: 16,
        payout_other: 17,
        incomes: { create: [{ name: "n", identifier: "id", value: 5 }] },
      }),
      include: { incomes: true },
    });
    expect(res.status).toBe(201);
  });

  it("ignores invalid csv lines", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.create as jest.Mock).mockResolvedValueOnce({
      id: "s1",
    });
    const csv =
      "year,month,brutto_tax,brutto_av,brutto_pv,brutto_rv,brutto_kv,deduction_tax_income,deduction_tax_church,deduction_tax_solidarity,deduction_tax_other,social_av,social_pv,social_rv,social_kv,payout_netto,payout_transfer,payout_vwl,payout_other,identifier,name,value\n" +
      "\n" +
      "2024,1,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,id,n,5\n" +
      "2024,1,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,, , \n";
    const req = new Request("http://localhost/api/user/import?format=csv", {
      method: "POST",
      body: csv,
    });
    const res = await POST(req as unknown as NextRequest);
    expect(prisma.statement.create).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
  });

  it("returns 400 for invalid format", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    const req = new Request("http://localhost/api/user/import", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it("handles errors on POST", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.deleteMany as jest.Mock).mockRejectedValueOnce("fail");
    const req = new Request("http://localhost/api/user/import", {
      method: "POST",
      body: JSON.stringify({
        statements: [{ month: 1, year: 2024, incomes: [] }],
      }),
    });
    const res = await POST(req as unknown as NextRequest);
    expect(mockHandleError).toHaveBeenCalledWith(
      "fail",
      "POST /api/user/import",
    );
    expect(res.status).toBe(500);
  });
});
