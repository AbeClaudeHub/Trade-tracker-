import {
  BEHAVIORAL_DIMENSIONS,
  type AssessmentResponses,
  type BehavioralDimension,
  type DimensionScores,
  type LikertValue,
} from "@/domain/types";
import { ASSESSMENT_QUESTIONS } from "./questions";

/**
 * Convert a Likert response into a "healthy behavior" value on a 0–1 scale.
 * Reverse-scored items are inverted so that 1 always means healthier behavior.
 */
function healthyValue(raw: LikertValue, reverse: boolean): number {
  const v = reverse ? 6 - raw : raw; // 1..5
  return (v - 1) / 4; // 0..1
}

/**
 * Produce weighted, normalised (0–100) scores per behavioral dimension.
 * Higher = healthier behavior on that dimension.
 *
 * Missing responses are simply excluded from their dimension's weighting so
 * partial assessments still yield a sensible (if lower-confidence) profile.
 */
export function scoreAssessment(responses: AssessmentResponses): DimensionScores {
  const acc: Record<BehavioralDimension, { sum: number; weight: number }> =
    Object.fromEntries(
      BEHAVIORAL_DIMENSIONS.map((d) => [d, { sum: 0, weight: 0 }]),
    ) as Record<BehavioralDimension, { sum: number; weight: number }>;

  for (const q of ASSESSMENT_QUESTIONS) {
    const raw = responses[q.id];
    if (raw === undefined) continue;
    const value = healthyValue(raw, q.reverse);
    acc[q.dimension].sum += value * q.weight;
    acc[q.dimension].weight += q.weight;
  }

  const scores = {} as DimensionScores;
  for (const d of BEHAVIORAL_DIMENSIONS) {
    const { sum, weight } = acc[d];
    scores[d] = weight === 0 ? 50 : Math.round((sum / weight) * 100);
  }
  return scores;
}

/** Overall behavioral baseline — the mean across all dimensions. */
export function baselineScore(scores: DimensionScores): number {
  const values = BEHAVIORAL_DIMENSIONS.map((d) => scores[d]);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Return dimensions sorted ascending (weakest first). */
export function rankDimensions(
  scores: DimensionScores,
): { dimension: BehavioralDimension; score: number }[] {
  return BEHAVIORAL_DIMENSIONS.map((d) => ({ dimension: d, score: scores[d] })).sort(
    (a, b) => a.score - b.score,
  );
}

/** How many of the assessment's items have been answered. */
export function answeredCount(responses: AssessmentResponses): number {
  return ASSESSMENT_QUESTIONS.reduce(
    (n, q) => (responses[q.id] !== undefined ? n + 1 : n),
    0,
  );
}
