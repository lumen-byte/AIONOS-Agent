import { NextResponse } from "next/server";
import { generateDailyBrief } from "@/lib/agent";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brief = await generateDailyBrief();
    return NextResponse.json(brief);
  } catch (error) {
    console.error("Failed to generate brief:", error);
    return NextResponse.json({ error: "Failed to generate daily brief" }, { status: 500 });
  }
}
