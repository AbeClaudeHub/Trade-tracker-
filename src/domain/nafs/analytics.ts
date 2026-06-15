import {
  NAFS_CATEGORIES,
  type NafsCategory,
  type NafsIncident,
  type NafsTally,
} from "@/domain/types";

export function emptyTally(): NafsTally {
  return Object.fromEntries(NAFS_CATEGORIES.map((c) => [c, 0])) as NafsTally;
}

/** Count incidents per category for incidents on/after `sinceDate`. */
export function tallyNafs(incidents: NafsIncident[], sinceDate?: string): NafsTally {
  const tally = emptyTally();
  for (const inc of incidents) {
    if (sinceDate && inc.date < sinceDate) continue;
    for (const c of inc.categories) tally[c] += 1;
  }
  return tally;
}

export function rankedNafs(tally: NafsTally): { category: NafsCategory; count: number }[] {
  return NAFS_CATEGORIES.map((category) => ({ category, count: tally[category] })).sort(
    (a, b) => b.count - a.count,
  );
}

export function dominantNafs(tally: NafsTally): NafsCategory | null {
  const ranked = rankedNafs(tally);
  return ranked[0] && ranked[0].count > 0 ? ranked[0].category : null;
}

export function totalIncidents(tally: NafsTally): number {
  return NAFS_CATEGORIES.reduce((s, c) => s + tally[c], 0);
}

/**
 * Nafs Control Index (0–100). Fewer internal-battle losses per active day → a
 * higher index. Zero incidents over the window = 100.
 */
export function nafsControlIndex(incidentCount: number, activeDays: number): number {
  if (activeDays <= 0) return 100;
  const rate = incidentCount / activeDays; // incidents per active day
  return Math.round(Math.max(0, Math.min(100, 100 - rate * 30)));
}
