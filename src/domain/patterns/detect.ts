import type { DailyEntry, DetectedPattern } from "@/domain/types";
import { BEHAVIOR_ACTIONS } from "@/domain/behavior/actions";
import { countViolations } from "@/domain/behavior/scoring";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function completed(entries: DailyEntry[]): DailyEntry[] {
  return entries
    .filter((e) => e.postMarket || e.actions.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function ratio(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}

/** Confidence grows with sample size and effect size, capped at 0.95. */
function confidence(sample: number, effect: number): number {
  const sizeFactor = Math.min(1, sample / 12);
  return Math.round(Math.min(0.95, sizeFactor * effect) * 100) / 100;
}

/**
 * Analyse a trader's history and surface recurring behavioral patterns.
 *
 * Every detector is conservative: it only fires with enough data and a clear
 * enough signal. The goal is for the user to feel *seen*, not lectured.
 */
export function detectPatterns(entries: DailyEntry[]): DetectedPattern[] {
  const days = completed(entries);
  const patterns: DetectedPattern[] = [];
  if (days.length < 5) return patterns;

  const totalViolations = days.reduce((s, e) => s + countViolations(e.actions), 0);
  const baseViolationRate = ratio(
    days.filter((e) => e.hadViolation).length,
    days.length,
  );

  // ── 1. Violations after a difficult day ─────────────────────────────────
  {
    let afterRoughTotal = 0;
    let afterRoughViolations = 0;
    for (let i = 1; i < days.length; i++) {
      const prev = days[i - 1]!;
      const isRough = prev.hadViolation || prev.score < 0;
      if (!isRough) continue;
      afterRoughTotal++;
      if (days[i]!.hadViolation) afterRoughViolations++;
    }
    const rate = ratio(afterRoughViolations, afterRoughTotal);
    if (afterRoughTotal >= 3 && rate > baseViolationRate + 0.2) {
      patterns.push({
        id: "after-rough-day",
        title: "Your worst days come in pairs.",
        detail: `When the day before was difficult, you broke your rules ${Math.round(
          rate * 100,
        )}% of the time — well above your usual ${Math.round(
          baseViolationRate * 100,
        )}%. The loss isn't the problem. What you do the next session is.`,
        severity: "alert",
        confidence: confidence(afterRoughTotal, rate - baseViolationRate + 0.4),
      });
    }
  }

  // ── 2. Day-of-week clustering ───────────────────────────────────────────
  {
    const byDow = new Map<number, { total: number; violations: number }>();
    for (const e of days) {
      const dow = new Date(e.date + "T00:00:00").getDay();
      const slot = byDow.get(dow) ?? { total: 0, violations: 0 };
      slot.total++;
      if (e.hadViolation) slot.violations++;
      byDow.set(dow, slot);
    }
    let worst: { dow: number; rate: number; total: number } | null = null;
    for (const [dow, slot] of byDow) {
      if (slot.total < 3) continue;
      const rate = ratio(slot.violations, slot.total);
      if (!worst || rate > worst.rate) worst = { dow, rate, total: slot.total };
    }
    if (worst && worst.rate > baseViolationRate + 0.2) {
      patterns.push({
        id: `dow-${worst.dow}`,
        title: `${WEEKDAYS[worst.dow]}s are your weak point.`,
        detail: `You break rules far more often on ${WEEKDAYS[worst.dow]}s (${Math.round(
          worst.rate * 100,
        )}%) than on other days. Something about how you start that day deserves attention.`,
        severity: "watch",
        confidence: confidence(worst.total, worst.rate - baseViolationRate + 0.3),
      });
    }
  }

  // ── 3. Breaking rules after a clean streak ──────────────────────────────
  {
    let afterStreakTotal = 0;
    let afterStreakViolations = 0;
    for (let i = 2; i < days.length; i++) {
      const cleanBefore = !days[i - 1]!.hadViolation && !days[i - 2]!.hadViolation;
      if (!cleanBefore) continue;
      afterStreakTotal++;
      if (days[i]!.hadViolation) afterStreakViolations++;
    }
    const rate = ratio(afterStreakViolations, afterStreakTotal);
    if (afterStreakTotal >= 3 && rate > baseViolationRate + 0.15) {
      patterns.push({
        id: "after-clean-streak",
        title: "Success loosens your grip.",
        detail: `After two clean days, your rule-breaking jumps to ${Math.round(
          rate * 100,
        )}%. Watch the moment you start to feel untouchable — that's where the drift begins.`,
        severity: "watch",
        confidence: confidence(afterStreakTotal, rate - baseViolationRate + 0.3),
      });
    }
  }

  // ── 4. Emotional state correlation ──────────────────────────────────────
  {
    let chargedTotal = 0;
    let chargedViolations = 0;
    let calmTotal = 0;
    let calmViolations = 0;
    for (const e of days) {
      const state = e.preMarket?.emotionalState;
      if (state === undefined) continue;
      if (state >= 4) {
        chargedTotal++;
        if (e.hadViolation) chargedViolations++;
      } else if (state <= 2) {
        calmTotal++;
        if (e.hadViolation) calmViolations++;
      }
    }
    const chargedRate = ratio(chargedViolations, chargedTotal);
    const calmRate = ratio(calmViolations, calmTotal);
    if (chargedTotal >= 3 && chargedRate > calmRate + 0.25) {
      patterns.push({
        id: "emotional-state",
        title: "Your emotions are predicting your mistakes.",
        detail: `On days you logged a high emotional state at the open, you broke rules ${Math.round(
          chargedRate * 100,
        )}% of the time — versus ${Math.round(
          calmRate * 100,
        )}% on calm days. Your pre-market feeling is an early warning you can act on.`,
        severity: "alert",
        confidence: confidence(chargedTotal, chargedRate - calmRate + 0.3),
      });
    }
  }

  // ── 5. The signature violation ──────────────────────────────────────────
  {
    const tally = new Map<string, number>();
    for (const e of days) {
      for (const a of e.actions) {
        if (BEHAVIOR_ACTIONS[a]?.isViolation) {
          tally.set(a, (tally.get(a) ?? 0) + 1);
        }
      }
    }
    let top: { id: string; count: number } | null = null;
    for (const [id, count] of tally) {
      if (!top || count > top.count) top = { id, count };
    }
    if (top && totalViolations >= 4 && top.count / totalViolations >= 0.4) {
      const action = BEHAVIOR_ACTIONS[top.id as keyof typeof BEHAVIOR_ACTIONS];
      patterns.push({
        id: `signature-${top.id}`,
        title: `Your signature leak: ${action.label.toLowerCase()}.`,
        detail: `"${action.label}" accounts for ${Math.round(
          (top.count / totalViolations) * 100,
        )}% of every rule you've broken. Fix this one behavior and you fix most of your days.`,
        severity: "insight",
        confidence: confidence(top.count, top.count / totalViolations + 0.2),
      });
    }
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}
