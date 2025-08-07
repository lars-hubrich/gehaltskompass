import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface IncomeData {
  id?: number;
  name: string;
  identifier: string;
  value: number;
}

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
  incomes?: IncomeData[];
}

export async function GET(context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { id } = await context.params;
  const statement = await prisma.statement.findUnique({
    where: { id },
    include: { incomes: true },
  });

  if (!statement) {
    return NextResponse.json({ error: "Statement not found" }, { status: 404 });
  }

  return NextResponse.json(statement);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const statement = await prisma.statement.findUnique({ where: { id } });
    if (!statement || statement.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or access denied" },
        { status: 404 },
      );
    }
    const data: UpdateData = await request.json();

    const { incomes, ...statementData } = data;

    const updatedStatement = await prisma.statement.update({
      where: { id },
      data: {
        ...statementData,
        incomes: incomes
          ? {
              upsert: incomes.map((income: IncomeData) => ({
                where: { id: income.id },
                update: {
                  name: income.name,
                  identifier: income.identifier,
                  value: income.value,
                },
                create: {
                  name: income.name,
                  identifier: income.identifier,
                  value: income.value,
                },
              })),
            }
          : undefined,
      },
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

export async function DELETE(context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const statement = await prisma.statement.findUnique({ where: { id } });
    if (!statement || statement.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or access denied" },
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
