import {
  BEHAVIORAL_DIMENSIONS,
  type ArchetypeId,
  type DimensionScores,
} from "@/domain/types";
import { ARCHETYPE_LIST, ARCHETYPES } from "./data";

/**
 * Determine which archetypes a behavioral profile pulls toward.
 *
 * Each archetype has a `fingerprint` weighting certain dimensions. We compute a
 * pull score for each archetype: the weaker a trader is on a fingerprinted
 * dimension, the stronger that archetype's pull. The result is ranked.
 */
export interface ArchetypeMatch {
  archetypeId: ArchetypeId;
  pull: number; // 0–100, relative pull strength
}

export function matchArchetypes(scores: DimensionScores): ArchetypeMatch[] {
  const raw = ARCHETYPE_LIST.map((arch) => {
    let weighted = 0;
    let totalWeight = 0;
    for (const dim of BEHAVIORAL_DIMENSIONS) {
      const w = arch.fingerprint[dim];
      if (w === undefined) continue;
      // "deficit" is how far the trader is from healthy (100) on this dim.
      const deficit = (100 - scores[dim]) / 100; // 0..1
      const magnitude = Math.abs(w);
      // Negative weights: low score increases pull. Positive weights: high
      // score increases pull (used sparingly, e.g. Hesitator + low impulse).
      const contribution = w < 0 ? deficit : 1 - deficit;
      weighted += contribution * magnitude;
      totalWeight += magnitude;
    }
    const pull = totalWeight === 0 ? 0 : (weighted / totalWeight) * 100;
    return { archetypeId: arch.id, pull: Math.round(pull) };
  });

  return raw.sort((a, b) => b.pull - a.pull);
}

/** Resolve the primary and (if meaningfully close) secondary archetype. */
export function resolveArchetype(scores: DimensionScores): {
  primary: ArchetypeId;
  secondary: ArchetypeId | null;
  matches: ArchetypeMatch[];
} {
  const matches = matchArchetypes(scores);
  const primary = matches[0]!.archetypeId;
  const second = matches[1];
  // Only surface a secondary if it's a genuine, near-equal pull.
  const secondary =
    second && matches[0]!.pull - second.pull <= 12 ? second.archetypeId : null;
  return { primary, secondary, matches };
}

export function getArchetype(id: ArchetypeId) {
  return ARCHETYPES[id];
}
