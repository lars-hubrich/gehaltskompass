/**
 * @jest-environment node
 */
import { POST } from "./route";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { MAX_FILE_SIZE } from "@/constants/limits";

const mockGenerate: jest.Mock = jest.fn();

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/prisma", () => ({
  user: { findUnique: jest.fn() },
}));
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(() => ({
    models: { generateContent: (...args: unknown[]) => mockGenerate(...args) },
  })),
  Type: {
    OBJECT: "object",
    ARRAY: "array",
    NUMBER: "number",
    STRING: "string",
  },
}));

describe("POST /api/extract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const fd2 = new FormData();
    const req = new Request("http://localhost/api/extract", {
      method: "POST",
      body: fd2,
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns 404 if user not found", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "a@b.c" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/extract", { method: "POST" });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(404);
  });

  it("returns 400 if no file uploaded", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "a@b.c" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });
    const fdNo = new FormData();
    const req = new Request("http://localhost/api/extract", {
      method: "POST",
      body: fdNo,
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns 400 if file is not pdf", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "a@b.c" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.append("file", new Blob(["text"], { type: "text/plain" }), "a.txt");
    const req = new Request("http://localhost/api/extract", {
      method: "POST",
      body: fd,
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns 400 if file exceeds size limit", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "a@b.c" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });
    const fd = new FormData();
    const big = new Blob([new Uint8Array(MAX_FILE_SIZE + 1)], {
      type: "application/pdf",
    });
    fd.append("file", big, "big.pdf");
    const req = new Request("http://localhost/api/extract", {
      method: "POST",
      body: fd,
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns parsed JSON on success", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "a@b.c" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.append(
      "file",
      new Blob(["pdf"], { type: "application/pdf" }),
      "test.pdf",
    );
    mockGenerate.mockResolvedValue({ text: JSON.stringify({ month: 1 }) });
    const req = new Request("http://localhost/api/extract", {
      method: "POST",
      body: fd,
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.month).toBe(1);
  });
});
