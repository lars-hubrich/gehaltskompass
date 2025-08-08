/**
 * @jest-environment node
 */
import { POST } from "./route";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

const mockGenerate = jest.fn();

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/prisma", () => ({
  user: { findUnique: jest.fn() },
  statement: { findMany: jest.fn() },
}));
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    models: { generateContent: (...args: any[]) => mockGenerate(...args) },
  })),
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ question: "Hi" }),
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns 400 if question missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "a@b.c" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns 404 if user not found", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "a@b.c" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ question: "Hallo" }),
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(404);
  });

  it("returns answer from model on success", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "a@b.c" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });
    (prisma.statement.findMany as jest.Mock).mockResolvedValue([]);
    mockGenerate.mockResolvedValue({ text: "Antwort" });
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ question: "Hallo?" }),
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ answer: "Antwort" });
  });
});
