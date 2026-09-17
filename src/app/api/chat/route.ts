import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/agent";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const answer = await answerQuestion(question);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Failed to answer question:", error);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
