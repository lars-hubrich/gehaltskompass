/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  statement: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
}));
jest.mock("@/lib/server-utils", () => ({
  requireAuthenticatedUser: jest.fn(),
  handleError: jest.fn(),
}));
import prisma from "@/lib/prisma";
import { GET, PUT, DELETE } from "./route";
import type { NextRequest } from "next/server";
import { requireAuthenticatedUser, handleError } from "@/lib/server-utils";
import { NextResponse } from "next/server";

// Cast mocks to `any` to simplify TypeScript typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRequire = requireAuthenticatedUser as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockHandleError = handleError as any;

describe("/api/statement/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleError.mockImplementation((e: unknown) =>
      NextResponse.json({ error: String(e) }, { status: 500 }),
    );
  });

  it("returns 404 when statement not found", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.findUnique as any).mockResolvedValueOnce(null);
    const res = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns statement when found", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.findUnique as any).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
      incomes: [],
    });
    const res = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "s1", user_id: "u1", incomes: [] });
  });

  it("returns 404 on PUT when statement missing", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.findUnique as any).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({ month: 2 }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 on DELETE when statement missing", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.findUnique as any).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/statement/s1", {
      method: "DELETE",
    });
    const res = await DELETE(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
  });

  it("deletes statement", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.findUnique as any).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.delete as any).mockResolvedValueOnce({});
    const req = new Request("http://localhost/api/statement/s1", {
      method: "DELETE",
    });
    const res = await DELETE(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(prisma.statement.delete).toHaveBeenCalledWith({
      where: { id: "s1" },
    });
    expect(res.status).toBe(200);
  });
});
