import {
  BEHAVIORAL_DIMENSIONS,
  type BehavioralDimension,
  type DailyEntry,
  type DimensionScores,
  type NafsIncident,
  type TransformationReport,
} from "@/domain/types";
import { BEHAVIOR_ACTIONS } from "@/domain/behavior/actions";
import { resolveArchetype } from "@/domain/archetypes/engine";
import { dominantNafs, tallyNafs } from "@/domain/nafs/analytics";
import { violationRate } from "@/domain/behavior/scoring";

/**
 * Behavior-derived dimension scores: recompute the nine dimensions from what the
 * trader ACTUALLY did, independent of the original assessment. This is what lets
 * the archetype "evolve" and powers the transformation report.
 *
 * Each affirming action credits its dimension; each violation debits it. Scores
 * are normalised to 0–100 around a neutral 50.
 */
export function behaviorDimensionScores(entries: DailyEntry[]): DimensionScores {
  const acc: Record<BehavioralDimension, { net: number; n: number }> =
    Object.fromEntries(
      BEHAVIORAL_DIMENSIONS.map((d) => [d, { net: 0, n: 0 }]),
    ) as Record<BehavioralDimension, { net: number; n: number }>;

  for (const e of entries) {
    if (!e.reviewedAt) continue;
    for (const a of e.actions) {
      const action = BEHAVIOR_ACTIONS[a];
      if (!action) continue;
      acc[action.dimension].net += action.points;
      acc[action.dimension].n += 1;
    }
  }

  const scores = {} as DimensionScores;
  for (const d of BEHAVIORAL_DIMENSIONS) {
    const { net, n } = acc[d];
    if (n === 0) {
      scores[d] = 50;
    } else {
      // Average signed points (~ -3..+1) mapped onto 0..100 around 50.
      const avg = net / n;
      scores[d] = Math.round(Math.max(0, Math.min(100, 50 + avg * 16.6)));
    }
  }
  return scores;
}

function windowEntries(entries: DailyEntry[], start: string, end: string): DailyEntry[] {
  return entries.filter((e) => e.date >= start && e.date <= end);
}

/**
 * Build a transformation report comparing a baseline window (first ~14 active
 * days) to the most recent window of equal length.
 */
export function buildTransformationReport(
  entries: DailyEntry[],
  incidents: NafsIncident[],
): TransformationReport | null {
  const reviewed = entries
    .filter((e) => e.reviewedAt)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (reviewed.length < 20) return null; // need enough history to be meaningful

  const windowSize = Math.min(14, Math.floor(reviewed.length / 2));
  const baseline = reviewed.slice(0, windowSize);
  const recent = reviewed.slice(-windowSize);

  const baseStart = baseline[0]!.date;
  const baseEnd = baseline[baseline.length - 1]!.date;
  const recentStart = recent[0]!.date;
  const recentEnd = recent[recent.length - 1]!.date;

  const baseDims = behaviorDimensionScores(baseline);
  const recentDims = behaviorDimensionScores(recent);

  const baseArch = resolveArchetype(baseDims).primary;
  const recentArch = resolveArchetype(recentDims).primary;

  const baseViol = violationRate(baseline);
  const recentViol = violationRate(recent);
  const violationReductionPct =
    baseViol === 0 ? 0 : Math.round(((baseViol - recentViol) / baseViol) * 100);

  // Emotional violations specifically (emotionalRegulation dimension)
  const emoBase = baseDims.emotionalRegulation;
  const emoRecent = recentDims.emotionalRegulation;
  const emotionalViolationReductionPct = Math.round(emoRecent - emoBase);

  const dimensionDeltas: Partial<Record<BehavioralDimension, number>> = {};
  for (const d of BEHAVIORAL_DIMENSIONS) {
    dimensionDeltas[d] = recentDims[d] - baseDims[d];
  }

  const baseTally = tallyNafs(incidents, baseStart);
  const recentTally = tallyNafs(
    incidents.filter((i) => i.date >= recentStart && i.date <= recentEnd),
  );

  return {
    baselineArchetypeId: baseArch,
    currentArchetypeId: recentArch,
    daysTracked: reviewed.length,
    disciplineDelta: Math.round(recentDims.discipline - baseDims.discipline),
    violationReductionPct,
    emotionalViolationReductionPct,
    dominantNafsBefore: dominantNafs(tallyNafs(incidents.filter((i) => i.date <= baseEnd))),
    dominantNafsNow: dominantNafs(recentTally),
    dimensionDeltas,
  };
}
