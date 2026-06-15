/**
 * Date helpers. All "day keys" are local-ISO `yyyy-MM-dd` strings, and weeks
 * begin on Monday (ISO week). Kept dependency-light and deterministic.
 */

export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Monday of the week containing `d`, as a `yyyy-MM-dd` key. */
export function weekStartKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

/** ISO week id, e.g. `2026-W24`. */
export function weekId(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function daysAgoKey(n: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return dayKey(d);
}

export function formatLongDate(key: string): string {
  return new Date(key + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(key: string): string {
  return new Date(key + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
