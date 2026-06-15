import {
  addDoc,
  arrayRemove,
  arrayUnion,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  BehaviorIndices,
  BoardRow,
  DailyEntry,
  DayState,
  NafsCategory,
  NudgeKind,
  Room,
  RoomFeedEvent,
  RoomMember,
  UserProfile,
} from "@/domain/types";
import { countViolations } from "@/domain/behavior/scoring";
import { isDemoMode } from "@/lib/demo/isDemo";
import { demo } from "@/lib/demo/store";
import { paths } from "./collections";

const ROOM_CAP = 7;

function makeInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── Room lifecycle ──────────────────────────────────────────────────────────

export async function createRoom(
  profile: UserProfile,
  name: string,
): Promise<Room> {
  if (isDemoMode()) return demo().room; // demo user already has a room
  const inviteCode = makeInviteCode();
  const room: Omit<Room, "id"> = {
    name: name.trim() || "Accountability Room",
    ownerId: profile.uid,
    inviteCode,
    memberCount: 1,
    cutoffLocalTime: "17:00",
    tzAnchor: profile.tz,
    encouragedTemplates: [],
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(paths.rooms(), { ...room, _createdAt: serverTimestamp() });
  await setDoc(paths.member(ref.id, profile.uid), memberDoc(ref.id, profile, "owner"));
  await updateDoc(paths.user(profile.uid), { roomIds: arrayUnion(ref.id) });
  return { ...room, id: ref.id };
}

function memberDoc(
  roomId: string,
  profile: UserProfile,
  role: RoomMember["role"],
): RoomMember {
  return {
    uid: profile.uid,
    roomId,
    role,
    displayName: profile.displayName,
    archetypeId: profile.archetypeId,
    joinedAt: new Date().toISOString(),
    streak: profile.indices?.currentStreak ?? 0,
    lastActiveDate: null,
    sharing: { score: true, nafs: true, reflections: false },
    weeklyPartnerUid: null,
  };
}

export async function joinByCode(profile: UserProfile, code: string): Promise<Room> {
  if (isDemoMode()) return demo().room;
  const q = query(paths.rooms(), where("inviteCode", "==", code.trim().toUpperCase()), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) throw new Error("No room found for that code.");
  const room = { ...(first.data() as Room), id: first.id };
  if (room.memberCount >= ROOM_CAP) throw new Error("This room is full (7 traders).");

  const existing = await getDoc(paths.member(room.id, profile.uid));
  if (existing.exists()) return room;

  await setDoc(paths.member(room.id, profile.uid), memberDoc(room.id, profile, "member"));
  await updateDoc(paths.room(room.id), { memberCount: increment(1) });
  await updateDoc(paths.user(profile.uid), { roomIds: arrayUnion(room.id) });
  return room;
}

export async function leaveRoom(roomId: string, uid: string): Promise<void> {
  if (isDemoMode()) return;
  await updateDoc(paths.room(roomId), { memberCount: increment(-1) });
  await updateDoc(paths.user(uid), { roomIds: arrayRemove(roomId) });
  // Member doc is left in place but excluded by membership checks; a Cloud
  // Function reconciles departures and rotating pairings.
}

export async function getRoom(roomId: string): Promise<Room | null> {
  if (isDemoMode()) return roomId === demo().room.id ? demo().room : null;
  const snap = await getDoc(paths.room(roomId));
  return snap.exists() ? { ...(snap.data() as Room), id: snap.id } : null;
}

export async function getMembers(roomId: string): Promise<RoomMember[]> {
  if (isDemoMode()) return demo().members;
  const snap = await getDocs(paths.members(roomId));
  return snap.docs.map((d) => d.data() as RoomMember);
}

// ── Board ─────────────────────────────────────────────────────────────────

function deriveState(entry: DailyEntry | null): DayState {
  if (!entry) return "absent";
  if (entry.reviewedAt) {
    if (entry.hadViolation) return "repeatedMistake";
    if (entry.dayScore >= 75) return "improved";
    return "followedThrough";
  }
  if (entry.committedAt) return "committed";
  return "absent";
}

/**
 * Write this member's board row to every room they belong to, exposing only the
 * fields they've consented to share. Called after commit and after review.
 */
export async function syncBoardRows(args: {
  profile: UserProfile;
  date: string;
  entry: DailyEntry | null;
  indices: BehaviorIndices;
  trend: "up" | "flat" | "down";
  topNafs: NafsCategory | null;
}): Promise<void> {
  const { profile, date, entry, indices, trend, topNafs } = args;

  if (isDemoMode()) {
    const row: BoardRow = {
      uid: profile.uid,
      date,
      displayName: profile.displayName,
      state: deriveState(entry),
      committedCount: entry?.commitments.length ?? 0,
      reviewed: Boolean(entry?.reviewedAt),
      honoredRate: entry?.honoredRate ?? 0,
      dayScore: entry?.dayScore ?? 0,
      streak: indices.currentStreak,
      trend,
      topNafs,
      updatedAt: new Date().toISOString(),
    };
    demo().board.set(`${date}:${profile.uid}`, row);
    const me = demo().members.find((m) => m.uid === profile.uid);
    if (me) {
      me.streak = indices.currentStreak;
      me.lastActiveDate = date;
    }
    return;
  }

  const members = await Promise.all(
    profile.roomIds.map((rid) => getDoc(paths.member(rid, profile.uid))),
  );

  await Promise.all(
    profile.roomIds.map((roomId, i) => {
      const m = members[i]?.data() as RoomMember | undefined;
      const sharing = m?.sharing ?? { score: true, nafs: true, reflections: false };
      const row: BoardRow = {
        uid: profile.uid,
        date,
        displayName: profile.displayName,
        state: deriveState(entry),
        committedCount: entry?.commitments.length ?? 0,
        reviewed: Boolean(entry?.reviewedAt),
        honoredRate: sharing.score ? (entry?.honoredRate ?? 0) : null,
        dayScore: sharing.score ? (entry?.dayScore ?? 0) : null,
        streak: indices.currentStreak,
        trend,
        topNafs: sharing.nafs ? topNafs : null,
        updatedAt: new Date().toISOString(),
      };
      return setDoc(paths.boardRow(roomId, date, profile.uid), row);
    }),
  );

  // Keep the lightweight member streak fresh for room headers.
  await Promise.all(
    profile.roomIds.map((roomId) =>
      updateDoc(paths.member(roomId, profile.uid), {
        streak: indices.currentStreak,
        lastActiveDate: date,
      }).catch(() => {}),
    ),
  );
}

export async function getBoard(roomId: string, date: string): Promise<BoardRow[]> {
  if (isDemoMode()) {
    return [...demo().board.entries()]
      .filter(([k]) => k.startsWith(`${date}:`))
      .map(([, v]) => v);
  }
  const snap = await getDocs(paths.boardRows(roomId, date));
  return snap.docs.map((d) => d.data() as BoardRow);
}

// ── Feed & nudges ───────────────────────────────────────────────────────────

export async function sendNudge(
  roomId: string,
  fromUid: string,
  toUid: string,
  kind: NudgeKind,
  date: string,
): Promise<void> {
  if (isDemoMode()) {
    demo().feed.unshift({
      id: `demo-feed-${Date.now()}`,
      roomId,
      type: "nudge",
      fromUid,
      toUid,
      date,
      nudgeKind: kind,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  await addDoc(paths.feed(roomId), {
    roomId,
    type: "nudge",
    fromUid,
    toUid,
    date,
    nudgeKind: kind,
    createdAt: new Date().toISOString(),
  });
}

export async function shareReflectionToRoom(
  roomId: string,
  fromUid: string,
  date: string,
  excerpt: string,
): Promise<void> {
  if (isDemoMode()) {
    demo().feed.unshift({
      id: `demo-feed-${Date.now()}`,
      roomId,
      type: "sharedReflection",
      fromUid,
      date,
      text: excerpt,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  await addDoc(paths.feed(roomId), {
    roomId,
    type: "sharedReflection",
    fromUid,
    date,
    text: excerpt,
    createdAt: new Date().toISOString(),
  });
}

export async function listFeed(roomId: string, max = 40): Promise<RoomFeedEvent[]> {
  if (isDemoMode()) {
    return [...demo().feed]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, max);
  }
  const q = query(paths.feed(roomId), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as RoomFeedEvent), id: d.id }));
}

// Re-exported helper for board summaries.
export function rowViolations(entry: DailyEntry): number {
  return countViolations(entry.actions);
}
