/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  user: { findUnique: jest.fn() },
}));
jest.mock("@/lib/server-utils", () => ({
  requireAuthenticatedUser: jest.fn(),
  handleError: jest.fn(),
}));

import { GET } from "./route";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

const mockRequire = requireAuthenticatedUser as jest.Mock;
const mockHandleError = handleError as jest.Mock;

describe("/api/user/export", () => {
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
    const req = new Request("http://localhost/api/user/export");
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns user data", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.user.findUnique as unknown as jest.Mock).mockResolvedValueOnce({
      id: "u1",
    });
    const req = new Request("http://localhost/api/user/export");
    const res = await GET(req as unknown as NextRequest);
    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "u1" });
  });

  it("returns 404 if user not found", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.user.findUnique as unknown as jest.Mock).mockResolvedValueOnce(
      null,
    );
    const req = new Request("http://localhost/api/user/export");
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(404);
  });

  it("handles errors on GET", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.user.findUnique as unknown as jest.Mock).mockRejectedValueOnce(
      "fail",
    );
    const req = new Request("http://localhost/api/user/export");
    const res = await GET(req as unknown as NextRequest);
    expect(mockHandleError).toHaveBeenCalledWith(
      "fail",
      "GET /api/user/export",
    );
    expect(res.status).toBe(500);
  });

  it("returns user data as csv", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.user.findUnique as unknown as jest.Mock).mockResolvedValueOnce({
      id: "u1",
      statements: [
        {
          year: 2024,
          month: 1,
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
          incomes: [{ identifier: "id", name: "n", value: 5 }],
        },
      ],
    });
    const req = new Request("http://localhost/api/user/export?format=csv");
    const res = await GET(req as unknown as NextRequest);
    expect(res.headers.get("content-type")).toBe("text/csv");
    expect(await res.text()).toBe(
      "year,month,brutto_tax,brutto_av,brutto_pv,brutto_rv,brutto_kv,deduction_tax_income,deduction_tax_church,deduction_tax_solidarity,deduction_tax_other,social_av,social_pv,social_rv,social_kv,payout_netto,payout_transfer,payout_vwl,payout_other,identifier,name,value\n" +
        "2024,1,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,id,n,5\n",
    );
  });
});
