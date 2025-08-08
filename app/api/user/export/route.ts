import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

/**
 * Exports all user data including statements and incomes.
 *
 * @param {NextRequest} req - The HTTP request.
 * @returns {Promise<NextResponse>} The user with related data or an error response.
 */
export async function GET(req: NextRequest) {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userOrRes.id },
      include: { statements: { include: { incomes: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const format = new URL(req.url).searchParams.get("format");
    if (format === "csv") {
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
      let csv = `${fields.join(",")},identifier,name,value\n`;
      for (const s of user.statements) {
        const stmtValues = fields.map((f) => (s as Record<string, unknown>)[f]);
        for (const inc of s.incomes) {
          csv += `${stmtValues.join(",")},${inc.identifier},${inc.name},${inc.value}\n`;
        }
      }
      return new Response(csv, {
        headers: { "Content-Type": "text/csv" },
      });
    }
    return NextResponse.json(user);
  } catch (error) {
    return handleError(error, "GET /api/user/export");
  }
}
