import { getDoc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import type { WeeklyReflection } from "@/domain/types";
import { weekId, weekStartKey } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo/isDemo";
import { demo } from "@/lib/demo/store";
import { paths } from "./collections";

export async function getReflection(
  uid: string,
  id: string = weekId(),
): Promise<WeeklyReflection | null> {
  if (isDemoMode()) return demo().reflections.find((r) => r.id === id) ?? null;
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
  if (isDemoMode()) {
    const list = demo().reflections;
    const idx = list.findIndex((r) => r.id === id);
    if (idx >= 0) list[idx] = reflection;
    else list.unshift(reflection);
    return reflection;
  }
  await setDoc(paths.reflection(uid, id), reflection);
  return reflection;
}

export async function saveReflectionSummary(
  uid: string,
  id: string,
  summary: string,
): Promise<void> {
  if (isDemoMode()) {
    const r = demo().reflections.find((x) => x.id === id);
    if (r) r.summary = summary;
    return;
  }
  await updateDoc(paths.reflection(uid, id), { summary });
}

/** Full reflection history, most recent first — the personal growth timeline. */
export async function listReflections(uid: string): Promise<WeeklyReflection[]> {
  if (isDemoMode()) {
    return [...demo().reflections].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  }
  const q = query(paths.reflections(uid), orderBy("weekStart", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WeeklyReflection);
}
