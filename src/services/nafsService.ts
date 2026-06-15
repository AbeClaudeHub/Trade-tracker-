import { addDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import type { NafsCategory, NafsIncident } from "@/domain/types";
import { isDemoMode } from "@/lib/demo/isDemo";
import { demo } from "@/lib/demo/store";
import { paths } from "./collections";

export async function logNafsIncident(
  uid: string,
  data: {
    date: string;
    categories: NafsCategory[];
    sourceType: "violation" | "brokenCommitment";
    sourceRef: string;
    note?: string;
    intensity?: 1 | 2 | 3;
  },
): Promise<void> {
  if (isDemoMode()) {
    demo().incidents.push({
      id: `demo-inc-${Date.now()}`,
      userId: uid,
      createdAt: new Date().toISOString(),
      ...data,
    });
    return;
  }
  await addDoc(paths.nafsIncidents(uid), {
    userId: uid,
    createdAt: new Date().toISOString(),
    ...data,
  });
}

export async function listNafsIncidents(
  uid: string,
  sinceDate: string,
): Promise<NafsIncident[]> {
  if (isDemoMode()) {
    return demo().incidents.filter((i) => i.date >= sinceDate);
  }
  const q = query(
    paths.nafsIncidents(uid),
    where("date", ">=", sinceDate),
    orderBy("date", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as NafsIncident), id: d.id }));
}
