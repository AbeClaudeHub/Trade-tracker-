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
  DailyEntry,
  PostMarketEntry,
  PreMarketEntry,
} from "@/domain/types";
import { hasViolation, scoreActions } from "@/domain/behavior/scoring";
import { todayKey } from "@/lib/dates";
import { paths } from "./collections";

function blankEntry(uid: string, date: string): DailyEntry {
  return {
    id: date,
    userId: uid,
    date,
    createdAt: new Date().toISOString(),
    actions: [],
    score: 0,
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

/** Save the morning (pre-market) check-in. */
export async function savePreMarket(
  uid: string,
  date: string,
  preMarket: PreMarketEntry,
): Promise<DailyEntry> {
  const existing = (await getDaily(uid, date)) ?? blankEntry(uid, date);
  const next: DailyEntry = { ...existing, preMarket };
  await setDoc(paths.daily(uid, date), next);
  return next;
}

/** Save the closing (post-market) review, recomputing the day's score. */
export async function savePostMarket(
  uid: string,
  date: string,
  postMarket: PostMarketEntry,
  actions: BehaviorActionId[],
): Promise<DailyEntry> {
  const existing = (await getDaily(uid, date)) ?? blankEntry(uid, date);
  const next: DailyEntry = {
    ...existing,
    postMarket,
    actions,
    score: scoreActions(actions),
    hadViolation: hasViolation(actions),
  };
  await setDoc(paths.daily(uid, date), next);
  return next;
}

/** List entries on/after `sinceDate` (yyyy-MM-dd), oldest first. */
export async function listDailies(
  uid: string,
  sinceDate: string,
): Promise<DailyEntry[]> {
  const q = query(
    paths.dailies(uid),
    where("date", ">=", sinceDate),
    orderBy("date", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyEntry);
}
