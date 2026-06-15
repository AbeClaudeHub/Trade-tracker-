import {
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import type {
  BehaviorActionId,
  Commitment,
  DailyEntry,
  PostMarketReview,
  PreMarketEntry,
} from "@/domain/types";
import { computeDayScore, hasViolation, honoredRate } from "@/domain/behavior/scoring";
import { todayKey } from "@/lib/dates";
import { paths } from "./collections";

function blankEntry(uid: string, date: string): DailyEntry {
  return {
    id: date,
    userId: uid,
    date,
    createdAt: new Date().toISOString(),
    commitments: [],
    actions: [],
    dayScore: 0,
    honoredRate: 0,
    hadViolation: false,
  };
}

export async function getDaily(
  uid: string,
  date: string = todayKey(),
): Promise<DailyEntry | null> {
  const snap = await getDoc(paths.daily(uid, date));
  return snap.exists() ? (snap.data() as DailyEntry) : null;
}

function recompute(entry: DailyEntry): DailyEntry {
  return {
    ...entry,
    dayScore: computeDayScore(entry.commitments, entry.actions, Boolean(entry.reviewedAt)),
    honoredRate: honoredRate(entry.commitments),
    hadViolation: hasViolation(entry.actions),
  };
}

/** Post the morning commitments (must happen BEFORE the session). */
export async function postCommitments(
  uid: string,
  date: string,
  commitments: Commitment[],
  preMarket: PreMarketEntry,
): Promise<DailyEntry> {
  const existing = (await getDaily(uid, date)) ?? blankEntry(uid, date);
  const next = recompute({
    ...existing,
    commitments,
    preMarket,
    committedAt: existing.committedAt ?? new Date().toISOString(),
  });
  await setDoc(paths.daily(uid, date), next);
  return next;
}

/** Complete the evening review: commitment outcomes, behaviors, reflection. */
export async function postReview(
  uid: string,
  date: string,
  commitmentStatus: Record<string, "honored" | "broken">,
  actions: BehaviorActionId[],
  postMarket: PostMarketReview,
): Promise<DailyEntry> {
  const existing = (await getDaily(uid, date)) ?? blankEntry(uid, date);
  const commitments = existing.commitments.map((c) => ({
    ...c,
    status: commitmentStatus[c.id] ?? c.status,
  }));
  const next = recompute({
    ...existing,
    commitments,
    actions,
    postMarket,
    reviewedAt: new Date().toISOString(),
  });
  await setDoc(paths.daily(uid, date), next);
  return next;
}

/** List entries on/after `sinceDate`, oldest first. */
export async function listDailies(uid: string, sinceDate: string): Promise<DailyEntry[]> {
  const q = query(
    paths.dailies(uid),
    where("date", ">=", sinceDate),
    orderBy("date", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyEntry);
}
