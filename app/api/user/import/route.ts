import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthenticatedUser, handleError } from "@/lib/server-utils";
import { ensurePositiveStatement } from "@/lib/statement-utils";

export async function POST(req: NextRequest) {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const body = await req.json();
    const statements = Array.isArray(body?.statements) ? body.statements : [];
    if (statements.length === 0) {
      return NextResponse.json({ error: "Ungültiges Format" }, { status: 400 });
    }
    const created = [];
    for (const s of statements) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { incomes = [], id, user_id, userId, ...rest } = ensurePositiveStatement(s);
      const stmt = await prisma.statement.create({
        data: {
          ...rest,
          user_id: userOrRes.id,
          incomes: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: incomes.map((inc: any) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, statement_id, statementId, ...incRest } = inc;
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

