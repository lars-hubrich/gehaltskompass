import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.error("GET /api/statement: Keine Sitzung gefunden");
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }
  if (!session.user?.email) {
    console.error("GET /api/statement: Keine E-Mail in der Sitzung");
    return NextResponse.json({ error: "Ungültige Sitzung" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    console.error("GET /api/statement: Benutzer nicht gefunden");
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 401 },
    );
  }
  try {
    const statements = await prisma.statement.findMany({
      where: { user_id: user.id },
      include: { incomes: true },
      // orderBy: { year: "desc", month: "desc" },
    });
    return NextResponse.json(statements);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/statements error:", error.message);
    } else {
      console.error("GET /api/statements error (unknown):", error);
    }
    return NextResponse.json(
      { error: "Could not fetch statements." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions); // request entfernt
  if (!session) {
    console.error("POST /api/statement: Keine Sitzung gefunden");
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }
  if (!session.user?.email) {
    console.error("POST /api/statement: Keine E-Mail in der Sitzung");
    return NextResponse.json({ error: "Ungültige Sitzung" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    console.error("POST /api/statement: Benutzer nicht gefunden");
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 401 },
    );
  }
  try {
    const body: StatementCreateBody = await request.json();

    const newStatement = await prisma.statement.create({
      data: {
        user_id: user.id,
        month: body.month,
        year: body.year,
        brutto_tax: body.brutto_tax,
        brutto_av: body.brutto_av,
        brutto_pv: body.brutto_pv,
        brutto_rv: body.brutto_rv,
        brutto_kv: body.brutto_kv,
        deduction_tax_income: body.deduction_tax_income,
        deduction_tax_church: body.deduction_tax_church,
        deduction_tax_solidarity: body.deduction_tax_solidarity,
        deduction_tax_other: body.deduction_tax_other,
        social_av: body.social_av,
        social_pv: body.social_pv,
        social_rv: body.social_rv,
        social_kv: body.social_kv,
        payout_netto: body.payout_netto,
        payout_transfer: body.payout_transfer,
        payout_vwl: body.payout_vwl,
        payout_other: body.payout_other,
        incomes: {
          create:
            body.incomes?.map((inc) => ({
              name: inc.name,
              identifier: inc.identifier,
              value: inc.value,
            })) ?? [],
        },
      },
      include: {
        incomes: true,
      },
    });

    return NextResponse.json(newStatement, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("POST /api/statements error:", error.message);
    } else {
      console.error("POST /api/statements error (unknown):", error);
    }
    return NextResponse.json(
      { error: "Could not create statement." },
      { status: 500 },
    );
  }
}
