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
  if (!question?.trim()) {
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

  const contextJson = JSON.stringify(statements, null, 2);

  console.log("DEBUG Lars Context JSON:", contextJson);

  const contents = [
    {
      role: "system",
      text: "Du bist ein Assistent, der ausschließlich Fragen zu Lohnabrechnungsdaten beantwortet. Antworte stets präzise. Verwende keine externen Daten oder Annahmen. Verwende keine Begrüßungen oder Nettigkeitsformeln. Sage klar, falls du eine Frage nicht beantworten kannst. Deine Antwort muss sich auf die Daten oder das Thema generell beziehen. Du darfst die Daten kombinieren und simple Berechnungen wie Summen auf diesen ausführen. Antworte stets in klaren deutschen Sätzen. Schreibe kein Code oder ähnliches. Schreibe kein JSON oder ähnliches.",
    },
    {
      role: "user",
      text: "Abrechnungsdaten des Nutzers:\n" + contextJson,
    },
    {
      role: "user",
      text: "Frage: " + question.trim(),
    },
  ];

  console.log("DEBUG Lars Contents:", contents);

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents,
      config: {
        temperature: 0.1,
        maxOutputTokens: 350,
      },
    });

    console.log("DEBUG Lars Res:", res);

    if (!res?.text) {
      return NextResponse.json(
        { error: "Keine Antwort von der KI erhalten" },
        { status: 500 },
      );
    }

    return NextResponse.json({ answer: res.text });
  } catch (err) {
    console.error("LLM-Fehler:", err);
    return NextResponse.json(
      { error: "Fehler bei der KI-Anfrage" },
      { status: 500 },
    );
  }
}
