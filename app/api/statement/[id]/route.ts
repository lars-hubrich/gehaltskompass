import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type IncomeCreateInput = {
  name: string;
  identifier: string;
  value: number;
};

type StatementUpdateBody = {
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
  incomes?: IncomeCreateInput[];
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const statement = await prisma.statement.findUnique({
      where: { id },
      include: { incomes: true },
    });
    if (!statement) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: StatementUpdateBody = await request.json();

    const exists = await prisma.statement.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const updateData = {
      ...(body.month !== undefined && { month: body.month }),
      ...(body.year !== undefined && { year: body.year }),
      ...(body.brutto_tax !== undefined && { brutto_tax: body.brutto_tax }),
      ...(body.brutto_av !== undefined && { brutto_av: body.brutto_av }),
      ...(body.brutto_pv !== undefined && { brutto_pv: body.brutto_pv }),
      ...(body.brutto_rv !== undefined && { brutto_rv: body.brutto_rv }),
      ...(body.brutto_kv !== undefined && { brutto_kv: body.brutto_kv }),
      ...(body.deduction_tax_income !== undefined && {
        deduction_tax_income: body.deduction_tax_income,
      }),
      ...(body.deduction_tax_church !== undefined && {
        deduction_tax_church: body.deduction_tax_church,
      }),
      ...(body.deduction_tax_solidarity !== undefined && {
        deduction_tax_solidarity: body.deduction_tax_solidarity,
      }),
      ...(body.deduction_tax_other !== undefined && {
        deduction_tax_other: body.deduction_tax_other,
      }),
      ...(body.social_av !== undefined && { social_av: body.social_av }),
      ...(body.social_pv !== undefined && { social_pv: body.social_pv }),
      ...(body.social_rv !== undefined && { social_rv: body.social_rv }),
      ...(body.social_kv !== undefined && { social_kv: body.social_kv }),
      ...(body.payout_netto !== undefined && {
        payout_netto: body.payout_netto,
      }),
      ...(body.payout_transfer !== undefined && {
        payout_transfer: body.payout_transfer,
      }),
      ...(body.payout_vwl !== undefined && { payout_vwl: body.payout_vwl }),
      ...(body.payout_other !== undefined && {
        payout_other: body.payout_other,
      }),
      ...(body.incomes && {
        incomes: {
          deleteMany: {},
          create: body.incomes.map((inc) => {
            return {
              name: inc.name,
              identifier: inc.identifier,
              value: inc.value,
            };
          }),
        },
      }),
    };

    const updated = await prisma.statement.update({
      where: { id },
      data: updateData,
      include: { incomes: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/statements/[id] error:", error);
    return NextResponse.json(
      { error: "Could not update statement." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const exists = await prisma.statement.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    await prisma.statement.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/statements/[id] error:", error);
    return NextResponse.json(
      { error: "Could not delete statement." },
      { status: 500 },
    );
  }
}
