import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";
import { ensurePositiveStatement } from "@/lib/statement-utils";
import { MAX_STATEMENTS_PER_USER } from "@/constants/limits";

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
  incomes: IncomeCreateInput[];
};

type BulkDeleteBody = {
  ids: string[];
};

/**
 * Retrieves all salary statements for the authenticated user.
 *
 * @returns {Promise<NextResponse>} A JSON response containing the statements or an error.
 */
export async function GET() {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const statements = await prisma.statement.findMany({
      where: { user_id: userOrRes.id },
      include: { incomes: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return NextResponse.json(statements);
  } catch (error) {
    return handleError(error, "GET /api/statement");
  }
}

/**
 * Creates a new salary statement for the authenticated user.
 *
 * @param {NextRequest} request - The incoming HTTP request with statement data.
 * @returns {Promise<NextResponse>} The created statement or an error response.
 */
export async function POST(request: NextRequest) {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const existing = await prisma.statement.count({
      where: { user_id: userOrRes.id },
    });
    if (existing >= MAX_STATEMENTS_PER_USER) {
      return NextResponse.json(
        { error: "Maximale Anzahl an Abrechnungen erreicht" },
        { status: 403 },
      );
    }
    const body: StatementCreateBody = ensurePositiveStatement(
      await request.json(),
    );
    if (
      body.month < 1 ||
      body.month > 12 ||
      body.year < 1900 ||
      body.year > 2100
    ) {
      return NextResponse.json(
        { error: "Ungültiger Monat oder Jahr" },
        { status: 400 },
      );
    }
    const existingSame = await prisma.statement.findFirst({
      where: {
        user_id: userOrRes.id,
        month: body.month,
        year: body.year,
      },
    });
    if (existingSame) {
      return NextResponse.json(
        { error: "Abrechnung für diesen Monat existiert bereits" },
        { status: 409 },
      );
    }
    const newStatement = await prisma.statement.create({
      data: {
        user_id: userOrRes.id,
        ...body,
        incomes: {
          create: body.incomes.map((inc) => ({
            name: inc.name,
            identifier: inc.identifier,
            value: inc.value,
          })),
        },
      },
      include: { incomes: true },
    });
    return NextResponse.json(newStatement, { status: 201 });
  } catch (error) {
    return handleError(error, "POST /api/statement");
  }
}

/**
 * Deletes multiple salary statements belonging to the authenticated user.
 *
 * @param {NextRequest} request - The incoming HTTP request containing statement IDs.
 * @returns {Promise<NextResponse>} The result of the deletion or an error response.
 */
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
        { error: "Keine Abrechnungs-IDs für die Löschung angegeben." },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Ungültiger Anfragetext." },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.statement.deleteMany({
      where: { id: { in: ids }, user_id: user.id },
    });
    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    return handleError(error, "DELETE /api/statement");
  }
}
