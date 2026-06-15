import { updateDoc } from "firebase/firestore";
import type { BehaviorIndices, DailyEntry, NafsIncident } from "@/domain/types";
import {
  cleanStreak,
  completionRate,
  consistencyScore,
  disciplineScore,
} from "@/domain/behavior/scoring";
import { nafsControlIndex } from "@/domain/nafs/analytics";
import { paths } from "./collections";

/** Compute the user's live behavioral indices from history. */
export function computeIndices(
  entries: DailyEntry[],
  incidents: NafsIncident[],
  todayIso: string,
): BehaviorIndices {
  const reviewed = entries.filter((e) => e.reviewedAt);
  const activeDays = reviewed.length;
  const streak = cleanStreak(entries, todayIso);

  return {
    disciplineScore: disciplineScore(entries),
    consistencyScore: consistencyScore(entries, todayIso),
    nafsControlIndex: nafsControlIndex(incidents.length, activeDays),
    completionRate: completionRate(entries),
    currentStreak: streak,
    longestStreak: streak, // refined server-side; client uses current as a floor
    lastComputedDate: todayIso,
  };
}

/** Persist indices onto the user profile for cheap dashboard + board reads. */
export async function persistIndices(
  uid: string,
  indices: BehaviorIndices,
): Promise<void> {
  await updateDoc(paths.user(uid), { indices });
}
