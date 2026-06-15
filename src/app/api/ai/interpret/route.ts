import { NextResponse } from "next/server";
import { ARCHETYPES } from "@/domain/archetypes/data";
import { interpretAssessment } from "@/lib/ai/insights";
import type { ArchetypeId, DimensionScores } from "@/domain/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { archetypeId, scores } = (await req.json()) as {
      archetypeId: ArchetypeId;
      scores: DimensionScores;
    };
    const archetype = ARCHETYPES[archetypeId];
    if (!archetype) {
      return NextResponse.json({ error: "Unknown archetype" }, { status: 400 });
    }
    const interpretation = await interpretAssessment(archetype, scores);
    return NextResponse.json({ interpretation });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed to interpret" },
      { status: 500 },
    );
  }
}
