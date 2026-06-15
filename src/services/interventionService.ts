import {
  addDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Intervention } from "@/domain/types";
import type { InterventionDraft } from "@/domain/interventions/engine";
import { isDemoMode } from "@/lib/demo/isDemo";
import { demo } from "@/lib/demo/store";
import { paths } from "./collections";

export async function listActiveInterventions(uid: string): Promise<Intervention[]> {
  if (isDemoMode()) {
    return demo().interventions.filter((i) => i.status === "active");
  }
  const q = query(
    paths.interventions(uid),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Intervention), id: d.id }));
}

/**
 * Persist newly-evaluated intervention drafts, skipping any whose trigger
 * already has an active intervention (avoids nagging).
 */
export async function reconcileInterventions(
  uid: string,
  drafts: InterventionDraft[],
): Promise<void> {
  if (isDemoMode()) return; // demo interventions are pre-seeded
  const active = await listActiveInterventions(uid);
  const activeTriggers = new Set(active.map((i) => i.trigger));
  const toCreate = drafts.filter((d) => !activeTriggers.has(d.trigger));

  await Promise.all(
    toCreate.map((d) =>
      addDoc(paths.interventions(uid), {
        userId: uid,
        status: "active",
        createdAt: new Date().toISOString(),
        ...d,
      }),
    ),
  );
}

export async function acknowledgeIntervention(
  uid: string,
  id: string,
): Promise<void> {
  if (isDemoMode()) {
    const i = demo().interventions.find((x) => x.id === id);
    if (i) i.status = "acknowledged";
    return;
  }
  await updateDoc(paths.intervention(uid, id), {
    status: "acknowledged",
    resolutionNote: "Acknowledged by trader",
  });
}

export async function resolveIntervention(uid: string, id: string): Promise<void> {
  await updateDoc(paths.intervention(uid, id), { status: "resolved" });
}
