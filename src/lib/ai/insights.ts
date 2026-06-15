import {
  DIMENSION_LABELS,
  NAFS_LABELS,
  type Report,
} from "@/domain/types";
import { rankDimensions } from "@/domain/assessment/scoring";
import { ARCHETYPES } from "@/domain/archetypes/data";
import { generate, isAiConfigured } from "./anthropic";

export interface ReportNarrative {
  interpretation: string;
  nafsNarrative: string;
  blueprintIntro: string;
}

/**
 * Layer AI-personalised prose onto a generated report. Always returns a full
 * narrative — if AI is unavailable, it composes a strong deterministic version
 * from the archetype content so the product is never empty.
 */
export async function generateReportNarrative(report: Report): Promise<ReportNarrative> {
  const archetype = ARCHETYPES[report.archetypeId];
  const weakest = rankDimensions(report.dimensionScores).slice(0, 2);
  const weakLabels = weakest.map((d) => DIMENSION_LABELS[d.dimension].toLowerCase());
  const dominant = NAFS_LABELS[report.dominantNafs];

  if (!isAiConfigured) {
    return {
      interpretation: [
        `Your profile points most clearly to ${archetype.name}. ${archetype.tagline}`,
        `Your behavior leans hardest on ${weakLabels.join(" and ")}. ${archetype.description}`,
        `Begin here: ${archetype.recommendations[0]}`,
      ].join("\n\n"),
      nafsNarrative: `Your dominant inner battle is ${dominant.toLowerCase()}. ${archetype.rootCauses[0]} The trade is the symptom; this is the source.`,
      blueprintIntro: `Over the next 30 days you'll move from ${archetype.transformation.signatureBehavior.toLowerCase()} toward ${archetype.transformation.replacementBehavior.toLowerCase()} — one keystone commitment at a time, reported daily in your room.`,
    };
  }

  const base = `Trader archetype: ${archetype.name} — ${archetype.tagline}
Weakest behavioral dimensions: ${weakLabels.join(", ")}.
Dominant nafs (inner driver): ${dominant}.
Signature self-sabotage loop: ${archetype.selfSabotageLoop.join(" → ")}.`;

  const [interpretation, nafsNarrative, blueprintIntro] = await Promise.all([
    generate({
      maxTokens: 480,
      prompt: `${base}

Write a personal, second-person interpretation (3 short paragraphs, ~150 words). Make them feel seen — connect their weakest dimensions and their dominant nafs to the archetype and the loop. End with the single most important shift to focus on. No trading advice.`,
    }),
    generate({
      maxTokens: 220,
      prompt: `${base}

In 2-3 sentences, explain how their dominant nafs (${dominant}) is the root cause beneath their trading mistakes. Calm, direct, perceptive. No trading advice.`,
    }),
    generate({
      maxTokens: 220,
      prompt: `${base}
Keystone commitment for 30 days: "${archetype.transformation.keystoneCommitment}"

Write a 2-3 sentence introduction to their personal 30-day discipline blueprint that motivates without hype. No trading advice.`,
    }),
  ]);

  return { interpretation, nafsNarrative, blueprintIntro };
}
