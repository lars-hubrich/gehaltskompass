import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const config = { api: { bodyParser: false } };

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const encoded = buffer.toString("base64");
  const contents = [
    {
      text: "Extrahiere Lohnabrechnungsdaten aus dem angehängten PDF:",
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
      "payout_netto",
      "incomes",
    ],
    additionalProperties: false,
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  return NextResponse.json(JSON.parse(<string>response.text));
}
