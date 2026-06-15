import { NextResponse } from "next/server";
import { generateReportNarrative } from "@/lib/ai/insights";
import type { Report } from "@/domain/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { report } = (await req.json()) as { report: Report };
    if (!report?.archetypeId) {
      return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    }
    const narrative = await generateReportNarrative(report);
    return NextResponse.json({ narrative });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed to generate narrative" },
      { status: 500 },
    );
  }
}
