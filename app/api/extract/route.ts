import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FIELD_DESCRIPTIONS_AI } from "@/constants/fieldDescriptions";
import { ensurePositiveStatement } from "@/lib/statements/utils";
import { MAX_FILE_SIZE } from "@/constants/limits";

// noinspection JSUnusedGlobalSymbols
export const config = { api: { bodyParser: false } };

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Extracts salary statement data from an uploaded PDF using Gemini.
 *
 * @param {NextRequest} req The HTTP request containing a PDF file in form-data.
 * @returns {Promise<NextResponse>} The extracted statement data or an error response.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 404 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as Blob | null;
  if (!file) {
    return NextResponse.json(
      { error: "Keine Datei hochgeladen" },
      { status: 400 },
    );
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Nur PDF-Dateien sind erlaubt" },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Datei ist zu groß" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const encoded = buffer.toString("base64");
  const fieldDescriptions = Object.entries(FIELD_DESCRIPTIONS_AI)
    .map(([key, desc]) => `${key}: ${desc}`)
    .join("\n");
  const contents = [
    {
      role: "system",
      text:
        "Extrahiere Lohnabrechnungsdaten aus dem angehängten PDF. Gib die folgenden Felder zurück und nutze ausschließlich die Daten aus der PDF. Falls du einen Wert nicht findest, setze ihn auf 0.\n" +
        fieldDescriptions,
    },
    { inlineData: { mimeType: "application/pdf", data: encoded } },
  ];

  const schema = {
    type: Type.OBJECT,
    properties: {
      month: { type: Type.NUMBER },
      year: { type: Type.NUMBER },
      brutto_tax: { type: Type.NUMBER },
      brutto_av: { type: Type.NUMBER },
      brutto_pv: { type: Type.NUMBER },
      brutto_rv: { type: Type.NUMBER },
      brutto_kv: { type: Type.NUMBER },
      deduction_tax_income: { type: Type.NUMBER },
      deduction_tax_church: { type: Type.NUMBER },
      deduction_tax_solidarity: { type: Type.NUMBER },
      deduction_tax_other: { type: Type.NUMBER },
      social_av: { type: Type.NUMBER },
      social_pv: { type: Type.NUMBER },
      social_rv: { type: Type.NUMBER },
      social_kv: { type: Type.NUMBER },
      payout_netto: { type: Type.NUMBER },
      payout_transfer: { type: Type.NUMBER },
      payout_vwl: { type: Type.NUMBER },
      payout_other: { type: Type.NUMBER },
      incomes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            identifier: { type: Type.STRING },
            value: { type: Type.NUMBER },
          },
          required: ["name", "identifier", "value"],
          additionalProperties: false,
        },
      },
    },
    required: [
      "month",
      "year",
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
      "incomes",
    ],
    additionalProperties: false,
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const raw = JSON.parse(<string>response.text);
  const data = ensurePositiveStatement(raw);
  return NextResponse.json(data);
}
