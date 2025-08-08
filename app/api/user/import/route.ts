import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";
import { ensurePositiveStatement } from "@/lib/statement-utils";
import { StatementData } from "@/constants/Interfaces";

type ImportedIncome = StatementData["incomes"][number] &
  Record<string, unknown>;

/**
 * Imports an array of salary statements for the authenticated user, replacing existing ones.
 *
 * @param {NextRequest} req - The HTTP request containing statements JSON or CSV data.
 * @returns {Promise<NextResponse>} The created statements or an error response.
 */
export async function POST(req: NextRequest) {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const format = new URL(req.url).searchParams.get("format");
    let statements: unknown[];
    if (format === "csv") {
      const text = await req.text();
      const lines = text.trim().split(/\r?\n/);
      const fields = [
        "year",
        "month",
        "brutto_tax",
        "brutto_av",
        "brutto_pv",
        "brutto_rv",
        "brutto_kv",
        "deduction_tax_income",
        "deduction_tax_church",
        "deduction_tax_solidarity",
        "deduction_tax_other",
        "social_av",
        "social_pv",
        "social_rv",
        "social_kv",
        "payout_netto",
        "payout_transfer",
        "payout_vwl",
        "payout_other",
      ] as const;
      lines.shift();
      const grouped: Record<
        string,
        Record<string, unknown> & { incomes: ImportedIncome[] }
      > = {};
      for (const line of lines) {
        if (!line) continue;
        const parts = line.split(",");
        const stmt: Record<string, unknown> = {};
        fields.forEach((f, i) => {
          const num = Number(parts[i]);
          if (!Number.isNaN(num)) stmt[f] = num;
        });
        const identifier = parts[fields.length];
        const name = parts[fields.length + 1];
        const value = Number(parts[fields.length + 2]);
        const year = Number(stmt.year);
        const month = Number(stmt.month);
        if (!year || !month || !identifier || !name) continue;
        const key = `${year}-${month}`;
        if (!grouped[key]) {
          grouped[key] = { ...stmt, incomes: [] };
        }
        grouped[key].incomes.push({ identifier, name, value });
      }
      statements = Object.values(grouped);
    } else {
      const body = await req.json();
      statements = Array.isArray(body?.statements) ? body.statements : [];
    }
    if (!Array.isArray(statements) || statements.length === 0) {
      return NextResponse.json({ error: "Ungültiges Format" }, { status: 400 });
    }
    // Remove all existing statements of the user before importing new ones
    await prisma.statement.deleteMany({ where: { user_id: userOrRes.id } });

    const created = [];
    for (const s of statements) {
      const {
        incomes = [],
        id,
        user_id,
        userId,
        ...rest
      } = ensurePositiveStatement(s as StatementData);
      void id;
      void user_id;
      void userId;
      const stmt = await prisma.statement.create({
        data: {
          ...rest,
          user_id: userOrRes.id,
          incomes: {
            create: incomes.map((inc) => {
              const { id, statement_id, statementId, ...incRest } =
                inc as ImportedIncome;
              void id;
              void statement_id;
              void statementId;
              return incRest;
            }),
          },
        },
        include: { incomes: true },
      });
      created.push(stmt);
    }
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleError(error, "POST /api/user/import");
  }
}
