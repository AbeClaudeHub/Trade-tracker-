import {
  type BehaviorActionId,
  type BehaviorTrendPoint,
  type DailyEntry,
  type ScoreWindow,
} from "@/domain/types";
import { BEHAVIOR_ACTIONS } from "./actions";

/** Compute the behavior score for a single day's selected actions. */
export function scoreActions(actions: BehaviorActionId[]): number {
  return actions.reduce((sum, id) => sum + (BEHAVIOR_ACTIONS[id]?.points ?? 0), 0);
}

export function countViolations(actions: BehaviorActionId[]): number {
  return actions.filter((id) => BEHAVIOR_ACTIONS[id]?.isViolation).length;
}

export function hasViolation(actions: BehaviorActionId[]): boolean {
  return actions.some((id) => BEHAVIOR_ACTIONS[id]?.isViolation);
}

/** Aggregate a set of daily entries into a windowed summary. */
export function summarizeWindow(entries: DailyEntry[]): ScoreWindow {
  const scored = entries.filter((e) => e.postMarket || e.actions.length > 0);
  const total = scored.reduce((s, e) => s + e.score, 0);
  const violations = scored.reduce((s, e) => s + countViolations(e.actions), 0);
  const affirmations = scored.reduce(
    (s, e) => s + e.actions.filter((a) => !BEHAVIOR_ACTIONS[a]?.isViolation).length,
    0,
  );
  const days = scored.length;
  return {
    total,
    days,
    average: days === 0 ? 0 : Math.round((total / days) * 10) / 10,
    violations,
    affirmations,
  };
}

/**
 * The consistency streak: consecutive most-recent days (ending today or
 * yesterday) that were completed with zero violations.
 */
export function consistencyStreak(entries: DailyEntry[], todayIso: string): number {
  const byDate = new Map(entries.map((e) => [e.date, e]));
  let streak = 0;
  const cursor = new Date(todayIso + "T00:00:00");

  // Allow the streak to "start" today or yesterday so an as-yet-unfilled
  // today doesn't break a healthy run.
  let started = false;
  for (let i = 0; i < 400; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    const entry = byDate.get(iso);
    const completed = entry && (entry.postMarket || entry.actions.length > 0);

    if (!completed) {
      if (!started && i === 0) {
        // today not done yet — keep looking back one day
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
    started = true;
    if (entry!.hadViolation) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Build a daily trend series (most recent last) for charting. */
export function buildTrend(entries: DailyEntry[]): BehaviorTrendPoint[] {
  return [...entries]
    .filter((e) => e.postMarket || e.actions.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, score: e.score }));
}

/**
 * Map an average daily behavior score to a calm 0–100 discipline index for
 * display. A perfect day is +4 (all four affirmations); we treat +3 as the
 * top of the everyday range so the index is encouraging but honest.
 */
export function disciplineIndex(averageDaily: number): number {
  const clamped = Math.max(-4, Math.min(4, averageDaily));
  return Math.round(((clamped + 4) / 8) * 100);
}
