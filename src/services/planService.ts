import { getDoc, setDoc } from "firebase/firestore";
import type { PlanProgress } from "@/domain/types";
import { todayKey } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo/isDemo";
import { demo } from "@/lib/demo/store";
import { paths } from "./collections";

function fresh(): PlanProgress {
  return { startDate: todayKey(), completed: [], updatedAt: new Date().toISOString() };
}

export async function getPlanProgress(uid: string): Promise<PlanProgress> {
  if (isDemoMode()) {
    if (!demo().plan) demo().plan = fresh();
    return demo().plan!;
  }
  const snap = await getDoc(paths.plan(uid));
  return snap.exists() ? (snap.data() as PlanProgress) : fresh();
}

/** Toggle a day's completion and persist. Returns the updated progress. */
export async function toggleDay(uid: string, day: number): Promise<PlanProgress> {
  const current = await getPlanProgress(uid);
  const set = new Set(current.completed);
  if (set.has(day)) set.delete(day);
  else set.add(day);
  const next: PlanProgress = {
    startDate: current.startDate,
    completed: [...set].sort((a, b) => a - b),
    updatedAt: new Date().toISOString(),
  };
  if (isDemoMode()) {
    demo().plan = next;
    return next;
  }
  await setDoc(paths.plan(uid), next);
  return next;
}
