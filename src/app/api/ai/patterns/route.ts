import { NextResponse } from "next/server";
import { narratePatterns } from "@/lib/ai/insights";
import type { DetectedPattern } from "@/domain/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { patterns } = (await req.json()) as { patterns: DetectedPattern[] };
    const narrative = await narratePatterns(patterns ?? []);
    return NextResponse.json({ narrative });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed to narrate" },
      { status: 500 },
    );
  }
}
