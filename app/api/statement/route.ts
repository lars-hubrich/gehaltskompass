import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

type IncomeCreateInput = {
  name: string;
  identifier: string;
  value: number;
};

type StatementCreateBody = {
  month: number;
  year: number;
  brutto_tax: number;
  brutto_av: number;
  brutto_pv: number;
  brutto_rv: number;
  brutto_kv: number;
  deduction_tax_income: number;
  deduction_tax_church: number;
  deduction_tax_solidarity: number;
  deduction_tax_other: number;
  social_av: number;
  social_pv: number;
  social_rv: number;
  social_kv: number;
  payout_netto: number;
  payout_transfer: number;
  payout_vwl: number;
  payout_other: number;
  incomes?: IncomeCreateInput[];
};

type BulkDeleteBody = {
  ids: string[];
};

export async function GET() {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const statements = await prisma.statement.findMany({
      where: { user_id: userOrRes.id },
      include: { incomes: true },
      orderBy: { year: "desc", month: "desc" },
    });
    return NextResponse.json(statements);
  } catch (error) {
    return handleError(error, "GET /api/statements");
  }
}

export async function POST(request: NextRequest) {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const body: StatementCreateBody = await request.json();
    const newStatement = await prisma.statement.create({
      data: {
        user_id: userOrRes.id,
        ...body,
        incomes: {
          create:
            body.incomes?.map((inc) => ({
              name: inc.name,
              identifier: inc.identifier,
              value: inc.value,
            })) ?? [],
        },
      },
      include: { incomes: true },
    });
    return NextResponse.json(newStatement, { status: 201 });
  } catch (error) {
    return handleError(error, "POST /api/statements");
  }
}

export async function DELETE(request: NextRequest) {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  const user = userOrRes;

  let ids: string[];
  try {
    const body: BulkDeleteBody = await request.json();
    ids = body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No statement IDs provided for deletion." },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.statement.deleteMany({
      where: { id: { in: ids }, user_id: user.id },
    });
    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    return handleError(error, "DELETE /api/statements");
  }
}
