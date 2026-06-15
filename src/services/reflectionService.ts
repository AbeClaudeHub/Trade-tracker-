import { getDoc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import type { WeeklyReflection } from "@/domain/types";
import { weekId, weekStartKey } from "@/lib/dates";
import { paths } from "./collections";

export async function getReflection(
  uid: string,
  id: string = weekId(),
): Promise<WeeklyReflection | null> {
  const snap = await getDoc(paths.reflection(uid, id));
  return snap.exists() ? (snap.data() as WeeklyReflection) : null;
}

export async function saveReflection(
  uid: string,
  fields: Pick<WeeklyReflection, "improved" | "repeated" | "triggers" | "nextWeek">,
  id: string = weekId(),
): Promise<WeeklyReflection> {
  const existing = await getReflection(uid, id);
  const reflection: WeeklyReflection = {
    id,
    userId: uid,
    weekStart: existing?.weekStart ?? weekStartKey(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    summary: existing?.summary,
    ...fields,
  };
  await setDoc(paths.reflection(uid, id), reflection);
  return reflection;
}

export async function saveReflectionSummary(
  uid: string,
  id: string,
  summary: string,
): Promise<void> {
  await updateDoc(paths.reflection(uid, id), { summary });
}

/** Full reflection history, most recent first — the personal growth timeline. */
export async function listReflections(uid: string): Promise<WeeklyReflection[]> {
  const q = query(paths.reflections(uid), orderBy("weekStart", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WeeklyReflection);
}
