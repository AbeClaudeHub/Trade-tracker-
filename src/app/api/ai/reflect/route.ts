import { NextResponse } from "next/server";
import { summarizeWeek } from "@/lib/ai/insights";
import type { WeeklyReflection } from "@/domain/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { reflection, context } = (await req.json()) as {
      reflection: WeeklyReflection;
      context: { score: number; violations: number; streak: number };
    };
    const summary = await summarizeWeek(reflection, context);
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed to summarise" },
      { status: 500 },
    );
  }
}
