import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";
import { ensurePositiveStatement } from "@/lib/statement-utils";

interface ImportedIncome extends Record<string, unknown> {
  name: string;
  identifier: string;
  value: number;
}

export async function POST(req: NextRequest) {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const body = await req.json();
    const statements = Array.isArray(body?.statements) ? body.statements : [];
    if (statements.length === 0) {
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
      } = ensurePositiveStatement(s);
      void id;
      void user_id;
      void userId;
      const stmt = await prisma.statement.create({
        data: {
          ...rest,
          user_id: userOrRes.id,
          incomes: {
            create: (incomes as ImportedIncome[]).map((inc) => {
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
