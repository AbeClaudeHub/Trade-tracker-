import {
  type BehaviorActionId,
  type BehaviorTrendPoint,
  type Commitment,
  type DailyEntry,
  type ScoreWindow,
} from "@/domain/types";
import { BEHAVIOR_ACTIONS } from "./actions";

const AFFIRMING_COUNT = Object.values(BEHAVIOR_ACTIONS).filter(
  (a) => !a.isViolation,
).length;

export function countViolations(actions: BehaviorActionId[]): number {
  return actions.filter((id) => BEHAVIOR_ACTIONS[id]?.isViolation).length;
}

export function hasViolation(actions: BehaviorActionId[]): boolean {
  return actions.some((id) => BEHAVIOR_ACTIONS[id]?.isViolation);
}

export function honoredRate(commitments: Commitment[]): number {
  if (commitments.length === 0) return 0;
  const honored = commitments.filter((c) => c.status === "honored").length;
  return honored / commitments.length;
}

/**
 * The Day Score (0–100): the quality of a single day's behavior.
 *
 *   0.6 · commitmentRate  +  0.4 · affirmationRate  −  violationPenalty
 *
 * A day with no pre-committed commitments is capped at 60: you cannot earn a
 * top score without setting an intention before the session.
 */
export function computeDayScore(
  commitments: Commitment[],
  actions: BehaviorActionId[],
  reviewed: boolean,
): number {
  const total = commitments.length;
  const commitmentRate = total > 0 ? honoredRate(commitments) : reviewed ? 0.4 : 0;

  const affirmations = actions.filter((a) => !BEHAVIOR_ACTIONS[a]?.isViolation).length;
  const affirmationRate = AFFIRMING_COUNT === 0 ? 0 : affirmations / AFFIRMING_COUNT;

  const violationSeverity = actions.reduce(
    (s, a) => s + (BEHAVIOR_ACTIONS[a]?.isViolation ? Math.abs(BEHAVIOR_ACTIONS[a].points) : 0),
    0,
  );
  const violationPenalty = Math.min(0.6, violationSeverity * 0.1);

  let raw = 0.6 * commitmentRate + 0.4 * affirmationRate - violationPenalty;
  raw = Math.max(0, Math.min(1, raw));
  let score = Math.round(raw * 100);
  if (total === 0) score = Math.min(score, 60);
  return score;
}

/** Exponentially-weighted moving average of day scores (≈30-day half-life). */
export function disciplineScore(entries: DailyEntry[]): number {
  const scored = entries
    .filter((e) => e.reviewedAt)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (scored.length === 0) return 50;
  const alpha = 0.045;
  let ewma = scored[0]!.dayScore;
  for (let i = 1; i < scored.length; i++) {
    ewma = alpha * scored[i]!.dayScore + (1 - alpha) * ewma;
  }
  return Math.round(ewma);
}

/** % of the last `windowDays` calendar days with a completed review. */
export function consistencyScore(
  entries: DailyEntry[],
  todayIso: string,
  windowDays = 30,
): number {
  const reviewed = new Set(entries.filter((e) => e.reviewedAt).map((e) => e.date));
  const today = new Date(todayIso + "T00:00:00");
  let hit = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (reviewed.has(d.toISOString().slice(0, 10))) hit++;
  }
  return Math.round((hit / windowDays) * 100);
}

/** Commitment completion rate over a set of entries. */
export function completionRate(entries: DailyEntry[]): number {
  let honored = 0;
  let total = 0;
  for (const e of entries) {
    total += e.commitments.length;
    honored += e.commitments.filter((c) => c.status === "honored").length;
  }
  return total === 0 ? 0 : honored / total;
}

/** Clean-day streak: consecutive recent days reviewed, no violations, ≥1 honored. */
export function cleanStreak(entries: DailyEntry[], todayIso: string): number {
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const cursor = new Date(todayIso + "T00:00:00");
  let streak = 0;
  let started = false;
  for (let i = 0; i < 400; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    const e = byDate.get(iso);
    const completed = e?.reviewedAt;
    if (!completed) {
      if (!started && i === 0) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
    started = true;
    const clean =
      !e!.hadViolation && e!.commitments.some((c) => c.status === "honored");
    if (!clean) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function summarizeWindow(entries: DailyEntry[]): ScoreWindow {
  const scored = entries.filter((e) => e.reviewedAt);
  const days = scored.length;
  const violations = scored.reduce((s, e) => s + countViolations(e.actions), 0);
  const affirmations = scored.reduce(
    (s, e) => s + e.actions.filter((a) => !BEHAVIOR_ACTIONS[a]?.isViolation).length,
    0,
  );
  const avg =
    days === 0 ? 0 : Math.round(scored.reduce((s, e) => s + e.dayScore, 0) / days);
  return {
    days,
    averageDayScore: avg,
    violations,
    affirmations,
    honoredRate: completionRate(scored),
  };
}

export function buildTrend(entries: DailyEntry[]): BehaviorTrendPoint[] {
  return [...entries]
    .filter((e) => e.reviewedAt)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, dayScore: e.dayScore }));
}

/** Violation rate (violations per reviewed day) for a window of entries. */
export function violationRate(entries: DailyEntry[]): number {
  const scored = entries.filter((e) => e.reviewedAt);
  if (scored.length === 0) return 0;
  return scored.reduce((s, e) => s + countViolations(e.actions), 0) / scored.length;
}
