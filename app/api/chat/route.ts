import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

export const config = { api: { bodyParser: true } };

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }

  const { question } = (await req.json()) as { question?: string };
  if (!question || question.trim().length === 0) {
    return NextResponse.json(
      { error: "Keine Frage angegeben" },
      { status: 400 },
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

  const statements = await prisma.statement.findMany({
    where: { user_id: user.id },
    include: { incomes: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const contextText = statements
    .map((st) => {
      const incs = st.incomes
        .map((i) => `  - ${i.name} (${i.identifier}): ${i.value}`)
        .join("\n");
      return [
        `Abrechnung: ${st.month}/${st.year}`,
        `Brutto Steuer: ${st.brutto_tax}`,
        `Brutto AV: ${st.brutto_av}`,
        `...`,
        `Netto Auszahlung: ${st.payout_netto}`,
        `Einnahmen:`,
        incs,
      ].join("\n");
    })
    .join("\n\n");

  console.log("DEBUG Lars Context: ", contextText);

  const contents = [
    {
      text: "Du bist ein intelligenter Assistent, der Fragen zu Lohnabrechnungsdaten beantwortet.",
    },
    {
      text: "Hier sind die letzten Abrechnungen des Nutzers:\n\n" + contextText,
    },
    { text: "Frage: " + question },
  ];

  console.log("DEBUG Lars Contents: ", contents);

  let aiResponse;
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      // config: {
      //   temperature: 0.2,
      //   maxOutputTokens: 512,
      // },
    });
    console.log("DEBUG Lars AI Response: ", res);
    if (!res || !res.text) {
      return NextResponse.json(
        { error: "Keine Antwort von der KI erhalten" },
        { status: 500 },
      );
    }
    aiResponse = res.text;
  } catch (err) {
    console.error("LLM-Fehler:", err);
    return NextResponse.json(
      { error: "Fehler bei der KI-Anfrage" },
      { status: 500 },
    );
  }

  return NextResponse.json({ answer: aiResponse });
}
