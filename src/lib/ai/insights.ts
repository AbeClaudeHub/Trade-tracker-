import {
  DIMENSION_LABELS,
  type Archetype,
  type DetectedPattern,
  type DimensionScores,
  type WeeklyReflection,
} from "@/domain/types";
import { rankDimensions } from "@/domain/assessment/scoring";
import { generate, isAiConfigured } from "./anthropic";

function scoreLines(scores: DimensionScores): string {
  return rankDimensions(scores)
    .map((d) => `- ${DIMENSION_LABELS[d.dimension]}: ${d.score}/100`)
    .join("\n");
}

/**
 * Interpret a completed assessment for a specific archetype.
 * Falls back to a composed, deterministic interpretation if AI is unavailable.
 */
export async function interpretAssessment(
  archetype: Archetype,
  scores: DimensionScores,
): Promise<string> {
  if (!isAiConfigured) {
    const weakest = rankDimensions(scores).slice(0, 2);
    return [
      `Your profile points most strongly to ${archetype.name}. ${archetype.tagline}`,
      "",
      `Your behavior leans hardest on ${weakest
        .map((d) => DIMENSION_LABELS[d.dimension].toLowerCase())
        .join(" and ")}. ${archetype.description}`,
      "",
      `Start here: ${archetype.recommendations[0]}`,
    ].join("\n");
  }

  const prompt = `A trader completed the behavioral assessment. Their primary archetype is "${archetype.name}" — ${archetype.tagline}

Dimension scores (0 = unhealthy behavior, 100 = healthy):
${scoreLines(scores)}

Write a personal, second-person interpretation (3 short paragraphs, ~140 words total). Help them recognise themselves. Connect their two weakest dimensions to the archetype. End with the single most important behavioral shift to focus on first. Do not give trading advice.`;

  return generate({ prompt, maxTokens: 500 });
}

/** Summarise a week of reflection answers into a short, honest paragraph. */
export async function summarizeWeek(
  reflection: WeeklyReflection,
  context: { score: number; violations: number; streak: number },
): Promise<string> {
  if (!isAiConfigured) {
    return `This week your behavior score was ${context.score} with ${context.violations} violation${
      context.violations === 1 ? "" : "s"
    }. You named that "${reflection.repeated || "—"}" repeated, and you intend to change "${
      reflection.nextWeek || "—"
    }". Hold yourself to that one change.`;
  }

  const prompt = `A trader wrote their weekly reflection. Behavior score: ${context.score}, violations: ${context.violations}, current streak: ${context.streak} days.

What improved: ${reflection.improved || "(blank)"}
What repeated: ${reflection.repeated || "(blank)"}
What triggered mistakes: ${reflection.triggers || "(blank)"}
What they'll change: ${reflection.nextWeek || "(blank)"}

Write a 3-4 sentence summary that reflects their growth honestly, names the pattern they should watch, and affirms the one change they committed to. Calm and direct. No trading advice.`;

  return generate({ prompt, maxTokens: 320 });
}

/** Turn detected patterns into one cohesive, gently confronting narrative. */
export async function narratePatterns(
  patterns: DetectedPattern[],
): Promise<string> {
  if (patterns.length === 0) return "";
  if (!isAiConfigured) {
    return patterns.map((p) => `${p.title} ${p.detail}`).join("\n\n");
  }

  const prompt = `These behavioral patterns were detected in a trader's history:

${patterns.map((p) => `- ${p.title} ${p.detail}`).join("\n")}

Write a short, cohesive reflection (2-3 sentences) that connects these patterns into a single insight about how this trader sabotages themselves. Make them feel seen, not judged. No trading advice.`;

  return generate({ prompt, maxTokens: 240 });
}
