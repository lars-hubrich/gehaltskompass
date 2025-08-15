/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  statement: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  },
}));
jest.mock("@/lib/server-utils", () => ({
  requireAuthenticatedUser: jest.fn(),
  handleError: jest.fn(),
}));

import { DELETE, GET, POST } from "./route";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

const mockRequire = requireAuthenticatedUser as jest.Mock;
const mockHandleError = handleError as jest.Mock;
describe("/api/statement root", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.statement.findMany as jest.Mock).mockReset();
    (prisma.statement.create as jest.Mock).mockReset();
    (prisma.statement.deleteMany as jest.Mock).mockReset();
    (prisma.statement.count as jest.Mock).mockReset();
    (prisma.statement.findFirst as jest.Mock).mockReset();
    mockHandleError.mockImplementation((e: unknown) =>
      NextResponse.json({ error: String(e) }, { status: 500 }),
    );
  });

  it("returns 401 if not authenticated on GET", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns statements for authenticated user", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findMany as jest.Mock).mockResolvedValueOnce([
      { id: "s1" },
    ]);
    const res = await GET();
    expect(prisma.statement.findMany).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: "s1" }]);
  });

  it("handles errors on GET", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findMany as jest.Mock).mockRejectedValueOnce("fail");
    const res = await GET();
    expect(mockHandleError).toHaveBeenCalledWith("fail", "GET /api/statement");
    expect(res.status).toBe(500);
  });

  it("returns 401 if not authenticated on POST", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const req = new Request("http://localhost/api/statement", {
      method: "POST",
      body: JSON.stringify({ month: 1, year: 2024, incomes: [] }),
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(401);
  });

  it("creates statement on POST", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.count as jest.Mock).mockResolvedValueOnce(0);
    (prisma.statement.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.statement.create as jest.Mock).mockResolvedValueOnce({ id: "s1" });
    const req = new Request("http://localhost/api/statement", {
      method: "POST",
      body: JSON.stringify({
        month: 1,
        year: 2024,
        incomes: [{ name: "n", identifier: "id", value: 5 }],
      }),
    });
    const res = await POST(req as NextRequest);
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

  it("returns 403 if user exceeded limit on POST", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.count as jest.Mock).mockResolvedValueOnce(20);
    (prisma.statement.findFirst as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/statement", {
      method: "POST",
      body: JSON.stringify({ month: 1, year: 2024, incomes: [] }),
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(403);
  });

  it("returns 400 on invalid month", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.count as jest.Mock).mockResolvedValueOnce(0);
    (prisma.statement.findFirst as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/statement", {
      method: "POST",
      body: JSON.stringify({ month: 13, year: 2024, incomes: [] }),
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns 409 if statement exists for month", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.count as jest.Mock).mockResolvedValueOnce(0);
    (prisma.statement.findFirst as jest.Mock).mockReturnValue(
      Promise.resolve({ id: "s" }),
    );
    const req = new Request("http://localhost/api/statement", {
      method: "POST",
      body: JSON.stringify({ month: 1, year: 2024, incomes: [] }),
    });
    const res = await POST(req as NextRequest);
    expect(prisma.statement.findFirst).toHaveBeenCalled();
    expect(res.status).toBe(409);
    expect(prisma.statement.create).not.toHaveBeenCalled();
  });

  it("handles errors on POST", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.count as jest.Mock).mockResolvedValueOnce(0);
    (prisma.statement.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.statement.create as jest.Mock).mockRejectedValueOnce("fail");
    const req = new Request("http://localhost/api/statement", {
      method: "POST",
      body: JSON.stringify({ month: 1, year: 2024, incomes: [] }),
    });
    const res = await POST(req as NextRequest);
    expect(mockHandleError).toHaveBeenCalledWith("fail", "POST /api/statement");
    expect(res.status).toBe(500);
  });

  it("returns 400 if no ids on DELETE", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    const req = new Request("http://localhost/api/statement", {
      method: "DELETE",
      body: JSON.stringify({}),
    });
    const res = await DELETE(req as NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns 401 if not authenticated on DELETE", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const req = new Request("http://localhost/api/statement", {
      method: "DELETE",
      body: JSON.stringify({ ids: ["a"] }),
    });
    const res = await DELETE(req as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid JSON on DELETE", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const req = new Request("http://localhost/api/statement", {
      method: "DELETE",
      body: "not json",
    });
    const res = await DELETE(req as NextRequest);
    expect(res.status).toBe(400);
    consoleSpy.mockRestore();
  });

  it("deletes statements on DELETE", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.deleteMany as jest.Mock).mockResolvedValueOnce({
      count: 2,
    });
    const req = new Request("http://localhost/api/statement", {
      method: "DELETE",
      body: JSON.stringify({ ids: ["a", "b"] }),
    });
    const res = await DELETE(req as NextRequest);
    expect(prisma.statement.deleteMany).toHaveBeenCalled();
    expect(await res.json()).toEqual({ deletedCount: 2 });
  });

  it("handles deleteMany errors", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.deleteMany as jest.Mock).mockRejectedValueOnce("fail");
    const req = new Request("http://localhost/api/statement", {
      method: "DELETE",
      body: JSON.stringify({ ids: ["a"] }),
    });
    const res = await DELETE(req as NextRequest);
    expect(mockHandleError).toHaveBeenCalledWith(
      "fail",
      "DELETE /api/statement",
    );
    expect(res.status).toBe(500);
  });
});
