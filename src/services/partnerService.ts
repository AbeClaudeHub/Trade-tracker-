import {
  addDoc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  PartnerFeedback,
  PartnerLink,
  SharedSummary,
  UserProfile,
} from "@/domain/types";
import { paths } from "./collections";

/** Deterministic pair key so a link is unique regardless of who requests. */
function members(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function findUserByEmail(
  email: string,
): Promise<UserProfile | null> {
  const q = query(paths.users(), where("email", "==", email.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? (first.data() as UserProfile) : null;
}

/** The user's current partner link (active or pending), if any. */
export async function getMyLink(uid: string): Promise<PartnerLink | null> {
  const q = query(
    paths.partnerLinks(),
    where("members", "array-contains", uid),
    where("status", "in", ["active", "pending"]),
    limit(1),
  );
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? ({ ...(first.data() as PartnerLink), id: first.id }) : null;
}

export async function requestPartner(
  fromUid: string,
  toUid: string,
): Promise<PartnerLink> {
  const existing = await getMyLink(fromUid);
  if (existing) throw new Error("You already have a partner or a pending request.");

  const ref = await addDoc(paths.partnerLinks(), {
    members: members(fromUid, toUid),
    requestedBy: fromUid,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return {
    id: ref.id,
    members: members(fromUid, toUid),
    requestedBy: fromUid,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export async function respondToRequest(
  linkId: string,
  accept: boolean,
): Promise<void> {
  await updateDoc(paths.partnerLink(linkId), {
    status: accept ? "active" : "declined",
  });
}

export async function endPartnership(linkId: string): Promise<void> {
  await updateDoc(paths.partnerLink(linkId), { status: "declined" });
}

/** Read a partner's consent-gated shared profile. */
export async function getPartnerProfile(
  partnerUid: string,
): Promise<UserProfile | null> {
  const snap = await getDoc(paths.user(partnerUid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Update the current user's denormalised, consent-gated shared summary. */
export async function updateSharedSummary(
  uid: string,
  visibility: UserProfile["partnerVisibility"],
  data: { weeklyScore: number; streak: number; lastReflectionExcerpt: string },
): Promise<void> {
  const summary: SharedSummary = { updatedAt: new Date().toISOString() };
  if (visibility.behaviorScore) {
    summary.weeklyScore = data.weeklyScore;
    summary.streak = data.streak;
  }
  if (visibility.reflections && data.lastReflectionExcerpt) {
    summary.lastReflectionExcerpt = data.lastReflectionExcerpt;
  }
  await updateDoc(paths.user(uid), { sharedSummary: summary });
}

export async function sendFeedback(
  link: PartnerLink,
  fromUid: string,
  weekStart: string,
  message: string,
): Promise<void> {
  const toUserId = link.members.find((m) => m !== fromUid)!;
  await addDoc(paths.feedback(), {
    linkId: link.id,
    fromUserId: fromUid,
    toUserId,
    weekStart,
    message,
    createdAt: new Date().toISOString(),
  });
}

export async function listFeedback(linkId: string): Promise<PartnerFeedback[]> {
  const q = query(
    paths.feedback(),
    where("linkId", "==", linkId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as PartnerFeedback), id: d.id }));
}
