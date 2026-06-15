import type {
  DailyEntry,
  DetectedPattern,
  NafsIncident,
} from "@/domain/types";
import { BEHAVIOR_ACTIONS } from "@/domain/behavior/actions";
import { countViolations } from "@/domain/behavior/scoring";
import { COMMITMENT_BY_ID } from "@/domain/commitments/catalog";
import { NAFS_LABELS } from "@/domain/types";
import { rankedNafs, tallyNafs, totalIncidents } from "@/domain/nafs/analytics";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function completed(entries: DailyEntry[]): DailyEntry[] {
  return entries.filter((e) => e.reviewedAt).sort((a, b) => a.date.localeCompare(b.date));
}

function ratio(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}

function confidence(sample: number, effect: number): number {
  const sizeFactor = Math.min(1, sample / 12);
  return Math.round(Math.min(0.95, sizeFactor * effect) * 100) / 100;
}

/**
 * Analyse behavioral history and surface recurring loops. Conservative by
 * design — fires only with enough data and a clear signal. Patterns can carry an
 * intervention `trigger` consumed by the consequence engine.
 */
export function detectPatterns(
  entries: DailyEntry[],
  incidents: NafsIncident[] = [],
): DetectedPattern[] {
  const days = completed(entries);
  const patterns: DetectedPattern[] = [];
  if (days.length < 5) return patterns;

  const totalViolations = days.reduce((s, e) => s + countViolations(e.actions), 0);
  const baseRate = ratio(days.filter((e) => e.hadViolation).length, days.length);

  // 1. Violations after a difficult day
  {
    let total = 0;
    let viol = 0;
    for (let i = 1; i < days.length; i++) {
      const prev = days[i - 1]!;
      if (!(prev.hadViolation || prev.dayScore < 40)) continue;
      total++;
      if (days[i]!.hadViolation) viol++;
    }
    const rate = ratio(viol, total);
    if (total >= 3 && rate > baseRate + 0.2) {
      patterns.push({
        id: "after-rough-day",
        title: "Your worst days come in pairs.",
        detail: `After a difficult day, you broke your rules ${Math.round(
          rate * 100,
        )}% of the time — above your usual ${Math.round(baseRate * 100)}%. The loss isn't the problem; the next session is.`,
        severity: "alert",
        confidence: confidence(total, rate - baseRate + 0.4),
        trigger: "sameViolationRepeat",
      });
    }
  }

  // 2. Day-of-week clustering
  {
    const byDow = new Map<number, { total: number; viol: number }>();
    for (const e of days) {
      const dow = new Date(e.date + "T00:00:00").getDay();
      const slot = byDow.get(dow) ?? { total: 0, viol: 0 };
      slot.total++;
      if (e.hadViolation) slot.viol++;
      byDow.set(dow, slot);
    }
    let worst: { dow: number; rate: number; total: number } | null = null;
    for (const [dow, slot] of byDow) {
      if (slot.total < 3) continue;
      const rate = ratio(slot.viol, slot.total);
      if (!worst || rate > worst.rate) worst = { dow, rate, total: slot.total };
    }
    if (worst && worst.rate > baseRate + 0.2) {
      patterns.push({
        id: `dow-${worst.dow}`,
        title: `${WEEKDAYS[worst.dow]}s are your weak point.`,
        detail: `You break rules far more often on ${WEEKDAYS[worst.dow]}s (${Math.round(
          worst.rate * 100,
        )}%) than other days. How you start that day deserves attention.`,
        severity: "watch",
        confidence: confidence(worst.total, worst.rate - baseRate + 0.3),
      });
    }
  }

  // 3. Emotional-state correlation
  {
    let chargedT = 0,
      chargedV = 0,
      calmT = 0,
      calmV = 0;
    for (const e of days) {
      const s = e.preMarket?.emotionalState;
      if (s === undefined) continue;
      if (s >= 4) {
        chargedT++;
        if (e.hadViolation) chargedV++;
      } else if (s <= 2) {
        calmT++;
        if (e.hadViolation) calmV++;
      }
    }
    const chargedRate = ratio(chargedV, chargedT);
    const calmRate = ratio(calmV, calmT);
    if (chargedT >= 3 && chargedRate > calmRate + 0.25) {
      patterns.push({
        id: "emotional-state",
        title: "Your emotions are predicting your mistakes.",
        detail: `On high-emotion days you broke rules ${Math.round(
          chargedRate * 100,
        )}% of the time vs ${Math.round(calmRate * 100)}% on calm days. Your pre-market feeling is an early warning.`,
        severity: "alert",
        confidence: confidence(chargedT, chargedRate - calmRate + 0.3),
        trigger: "nafsSpike",
      });
    }
  }

  // 4. Signature violation
  {
    const tally = new Map<string, number>();
    for (const e of days)
      for (const a of e.actions)
        if (BEHAVIOR_ACTIONS[a]?.isViolation) tally.set(a, (tally.get(a) ?? 0) + 1);
    let top: { id: string; count: number } | null = null;
    for (const [id, count] of tally) if (!top || count > top.count) top = { id, count };
    if (top && totalViolations >= 4 && top.count / totalViolations >= 0.4) {
      const action = BEHAVIOR_ACTIONS[top.id as keyof typeof BEHAVIOR_ACTIONS];
      patterns.push({
        id: `signature-${top.id}`,
        title: `Your signature leak: ${action.label.toLowerCase()}.`,
        detail: `"${action.label}" is ${Math.round(
          (top.count / totalViolations) * 100,
        )}% of every rule you've broken. Fix this one behavior and you fix most of your days.`,
        severity: "insight",
        confidence: confidence(top.count, top.count / totalViolations + 0.2),
      });
    }
  }

  // 5. Commitment relapse — you keep breaking the same promise
  {
    const made = new Map<string, number>();
    const broke = new Map<string, number>();
    for (const e of days)
      for (const c of e.commitments) {
        if (!c.templateId) continue;
        made.set(c.templateId, (made.get(c.templateId) ?? 0) + 1);
        if (c.status === "broken") broke.set(c.templateId, (broke.get(c.templateId) ?? 0) + 1);
      }
    let worst: { id: string; rate: number; broke: number; made: number } | null = null;
    for (const [id, m] of made) {
      if (m < 3) continue;
      const b = broke.get(id) ?? 0;
      const rate = b / m;
      if (rate >= 0.4 && (!worst || rate > worst.rate)) worst = { id, rate, broke: b, made: m };
    }
    if (worst) {
      const t = COMMITMENT_BY_ID[worst.id];
      patterns.push({
        id: `commitment-relapse-${worst.id}`,
        title: `You keep breaking one promise: "${t?.label ?? worst.id}".`,
        detail: `You committed to this ${worst.made} times and broke it ${worst.broke}. A commitment you can't keep needs to get smaller, not louder.`,
        severity: "alert",
        confidence: confidence(worst.made, worst.rate + 0.2),
        trigger: "commitmentRelapse",
      });
    }
  }

  // 6. Dominant nafs battle
  {
    const tally = tallyNafs(incidents);
    const total = totalIncidents(tally);
    const ranked = rankedNafs(tally);
    if (total >= 5 && ranked[0] && ranked[0].count / total >= 0.4) {
      patterns.push({
        id: `nafs-${ranked[0].category}`,
        title: `Your dominant battle is ${NAFS_LABELS[ranked[0].category].toLowerCase()}.`,
        detail: `${NAFS_LABELS[ranked[0].category]} is behind ${Math.round(
          (ranked[0].count / total) * 100,
        )}% of your violations. The trade is the symptom; this is the root.`,
        severity: "insight",
        confidence: confidence(total, ranked[0].count / total + 0.2),
        trigger: "nafsSpike",
      });
    }
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}
