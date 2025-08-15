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
import { DELETE, GET, PUT } from "./route";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

const mockRequire = requireAuthenticatedUser as jest.Mock;
const mockHandleError = handleError as jest.Mock;

describe("/api/statement/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleError.mockImplementation((e: unknown) =>
      NextResponse.json({ error: String(e) }, { status: 500 }),
    );
  });

  it("returns 401 on GET when unauthenticated", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const res = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when statement not found", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns statement when found", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
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

  it("returns 404 when statement belongs to other user", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u2",
      incomes: [],
    });
    const res = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
  });

  it("handles errors on GET", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockRejectedValueOnce("fail");
    const res = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(mockHandleError).toHaveBeenCalledWith(
      "fail",
      "GET /api/statement/[id]",
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 on PUT when statement missing", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({ month: 2 }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 401 on PUT when unauthenticated", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({ month: 2 }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 on PUT when user mismatch", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u2",
    });
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({ month: 2 }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 on invalid month", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
      month: 1,
      year: 2024,
    });
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({ month: 13 }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 409 on duplicate month/year", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
      month: 1,
      year: 2024,
    });
    (prisma.statement.findFirst as jest.Mock).mockResolvedValueOnce({
      id: "other",
    });
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({ month: 2, year: 2024 }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(409);
  });

  it("updates statement with incomes", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
      month: 1,
      year: 2024,
    });
    (prisma.statement.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.statement.update as jest.Mock).mockResolvedValueOnce({
      id: "s1",
    });
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({
        incomes: [{ id: "i1", name: "n", identifier: "id", value: 5 }],
      }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(prisma.statement.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: {
        incomes: {
          upsert: [
            {
              where: { id: "i1" },
              update: { name: "n", identifier: "id", value: 5 },
              create: { name: "n", identifier: "id", value: 5 },
            },
          ],
        },
      },
      include: { incomes: true },
    });
    expect(res.status).toBe(200);
  });

  it("updates statement without incomes", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
      month: 1,
      year: 2024,
    });
    (prisma.statement.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.statement.update as jest.Mock).mockResolvedValueOnce({
      id: "s1",
    });
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({ month: 2 }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(prisma.statement.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { month: 2 },
      include: { incomes: true },
    });
    expect(res.status).toBe(200);
  });

  it("handles errors on PUT", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
      month: 1,
      year: 2024,
    });
    (prisma.statement.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.statement.update as jest.Mock).mockRejectedValueOnce("fail");
    const req = new Request("http://localhost/api/statement/s1", {
      method: "PUT",
      body: JSON.stringify({ month: 2 }),
    });
    const res = await PUT(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(mockHandleError).toHaveBeenCalledWith(
      "fail",
      "PUT /api/statement/[id]",
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 on DELETE when statement missing", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/statement/s1", {
      method: "DELETE",
    });
    const res = await DELETE(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 401 on DELETE when unauthenticated", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const req = new Request("http://localhost/api/statement/s1", {
      method: "DELETE",
    });
    const res = await DELETE(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 on DELETE when user mismatch", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u2",
    });
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
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
    });
    (prisma.statement.delete as jest.Mock).mockResolvedValueOnce({});
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

  it("handles errors on DELETE", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "s1",
      user_id: "u1",
    });
    (prisma.statement.delete as jest.Mock).mockRejectedValueOnce("fail");
    const req = new Request("http://localhost/api/statement/s1", {
      method: "DELETE",
    });
    const res = await DELETE(req as NextRequest, {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(mockHandleError).toHaveBeenCalledWith(
      "fail",
      "DELETE /api/statement/[id]",
    );
    expect(res.status).toBe(500);
  });
});
