import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";
import { ensurePositivePartialStatement } from "@/lib/statement-utils";

interface IncomeData {
  id?: string;
  name: string;
  identifier: string;
  value: number;
}

interface UpdateStatementData {
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
  id?: string;
  user_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userOrResponse = await requireAuthenticatedUser();
  if (!("id" in userOrResponse)) {
    return userOrResponse;
  }
  try {
    const { id } = await context.params;
    const statement = await prisma.statement.findUnique({
      where: { id },
      include: { incomes: true },
    });

    if (!statement || statement.user_id !== userOrResponse.id) {
      return NextResponse.json(
        { error: "Abrechnung nicht gefunden oder Zugriff verweigert" },
        { status: 404 },
      );
    }

    return NextResponse.json(statement);
  } catch (e) {
    return handleError(e, "GET /api/statement/[id]");
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userOrResponse = await requireAuthenticatedUser();
  if (!("id" in userOrResponse)) {
    return userOrResponse;
  }

  try {
    const { id } = await context.params;
    const existing = await prisma.statement.findUnique({ where: { id } });
    if (!existing || existing.user_id !== userOrResponse.id) {
      return NextResponse.json(
        { error: "Nicht gefunden oder Zugriff verweigert" },
        { status: 404 },
      );
    }

    const data: UpdateStatementData = ensurePositivePartialStatement(
      await request.json(),
    );
    const { incomes, ...statementData } = data;

    const newMonth = statementData.month ?? existing.month;
    const newYear = statementData.year ?? existing.year;
    if (newMonth < 1 || newMonth > 12 || newYear < 1900 || newYear > 2100) {
      return NextResponse.json(
        { error: "Ungültiger Monat oder Jahr" },
        { status: 400 },
      );
    }
    const duplicate = await prisma.statement.findFirst({
      where: {
        user_id: userOrResponse.id,
        month: newMonth,
        year: newYear,
        NOT: { id },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Abrechnung für diesen Monat existiert bereits" },
        { status: 409 },
      );
    }

    const updated = await prisma.statement.update({
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
      include: { incomes: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return handleError(e, "PUT /api/statement/[id]");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userOrResponse = await requireAuthenticatedUser();
  if (!("id" in userOrResponse)) {
    return userOrResponse;
  }
  try {
    const { id } = await context.params;
    const existing_statement = await prisma.statement.findUnique({
      where: { id },
    });
    if (
      !existing_statement ||
      existing_statement.user_id !== userOrResponse.id
    ) {
      return NextResponse.json(
        { error: "Nicht gefunden oder Zugriff verweigert" },
        { status: 404 },
      );
    }

    await prisma.statement.delete({ where: { id } });
    return NextResponse.json({ message: "Abrechnung gelöscht" });
  } catch (e) {
    return handleError(e, "DELETE /api/statement/[id]");
  }
}
