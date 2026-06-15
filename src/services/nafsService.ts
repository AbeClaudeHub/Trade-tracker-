import { addDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import type { NafsCategory, NafsIncident } from "@/domain/types";
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
  const q = query(
    paths.nafsIncidents(uid),
    where("date", ">=", sinceDate),
    orderBy("date", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as NafsIncident), id: d.id }));
}
