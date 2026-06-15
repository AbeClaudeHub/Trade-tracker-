import {
  NAFS_CATEGORIES,
  type BehavioralDimension,
  type DimensionScores,
  type NafsCategory,
  type NafsScores,
} from "@/domain/types";

/**
 * Each nafs is driven by weakness in certain behavioral dimensions. The weaker
 * the contributing dimensions, the stronger the nafs's pull. This lets us derive
 * a nafs profile directly from the assessment — no ongoing logging required.
 */
const NAFS_DIMENSIONS: Record<NafsCategory, BehavioralDimension[]> = {
  greed: ["risk", "patience"],
  fear: ["fear", "emotionalRegulation"],
  ego: ["ego", "accountability"],
  impatience: ["patience", "impulsiveness"],
  attachment: ["ego", "emotionalRegulation"],
  validationSeeking: ["accountability", "ego"],
  laziness: ["consistency", "discipline"],
  overconfidence: ["ego", "risk"],
};

/** Compute per-nafs tendency (0–100, higher = stronger battle). */
export function computeNafsScores(dimensions: DimensionScores): NafsScores {
  const scores = {} as NafsScores;
  for (const nafs of NAFS_CATEGORIES) {
    const dims = NAFS_DIMENSIONS[nafs];
    const deficit =
      dims.reduce((sum, d) => sum + (100 - dimensions[d]), 0) / dims.length;
    scores[nafs] = Math.round(deficit);
  }
  return scores;
}

export function rankNafs(
  scores: NafsScores,
): { category: NafsCategory; score: number }[] {
  return NAFS_CATEGORIES.map((category) => ({ category, score: scores[category] })).sort(
    (a, b) => b.score - a.score,
  );
}

export function dominantNafs(scores: NafsScores): NafsCategory {
  return rankNafs(scores)[0]!.category;
}

/** Second-strongest nafs, only if it's a meaningful battle (≥ 45). */
export function secondaryNafs(scores: NafsScores): NafsCategory | null {
  const ranked = rankNafs(scores);
  const second = ranked[1];
  return second && second.score >= 45 ? second.category : null;
}
