import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface UpdateData {
  month?: number;
  year?: number;
  brutto_tax?: number;
  brutto_av?: number;
  brutto_pv?: number;
  brutto_rv?: number;
  brutto_kv?: number;
  deduction_tax_income?: number;
  deduction_tax_church?: number;
  deduction_tax_solidarity?: number;
  deduction_tax_other?: number;
  social_av?: number;
  social_pv?: number;
  social_rv?: number;
  social_kv?: number;
  payout_netto?: number;
  payout_transfer?: number;
  payout_vwl?: number;
  payout_other?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 401 },
    );
  }
  try {
    const { id } = params;
    const statement = await prisma.statement.findUnique({
      where: { id },
      include: { incomes: true },
    });
    if (!statement || statement.user_id !== user.id) {
      return NextResponse.json(
        { error: "Nicht gefunden oder kein Zugriff" },
        { status: 404 },
      );
    }
    return NextResponse.json(statement);
  } catch (error) {
    console.error("GET /api/statements/[id] error:", error);
    return NextResponse.json(
      { error: "Could not fetch statement." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 401 },
    );
  }
  try {
    const { id } = params;
    const statement = await prisma.statement.findUnique({ where: { id } });
    if (!statement || statement.user_id !== user.id) {
      return NextResponse.json(
        { error: "Nicht gefunden oder kein Zugriff" },
        { status: 404 },
      );
    }
    const data: UpdateData = await request.json();
    const updatedStatement = await prisma.statement.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedStatement);
  } catch (error) {
    console.error("PUT /api/statements/[id] error:", error);
    return NextResponse.json(
      { error: "Could not update statement." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 401 },
    );
  }
  try {
    const { id } = params;
    const statement = await prisma.statement.findUnique({ where: { id } });
    if (!statement || statement.user_id !== user.id) {
      return NextResponse.json(
        { error: "Nicht gefunden oder kein Zugriff" },
        { status: 404 },
      );
    }
    await prisma.statement.delete({ where: { id } });
    return NextResponse.json({ message: "Statement deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/statements/[id] error:", error);
    return NextResponse.json(
      { error: "Could not delete statement." },
      { status: 500 },
    );
  }
}
