import { collection, collectionGroup, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

/**
 * Centralised Firestore paths (v2). Per-user behavioral data lives under
 * `users/{uid}/...`. Rooms are top-level with denormalised, consent-filtered
 * board rows that members write for themselves.
 */
export const paths = {
  user: (uid: string) => doc(getDb(), "users", uid),
  users: () => collection(getDb(), "users"),

  assessments: (uid: string) => collection(getDb(), "users", uid, "assessments"),
  assessment: (uid: string, id: string) => doc(getDb(), "users", uid, "assessments", id),

  dailies: (uid: string) => collection(getDb(), "users", uid, "dailies"),
  daily: (uid: string, id: string) => doc(getDb(), "users", uid, "dailies", id),

  nafsIncidents: (uid: string) => collection(getDb(), "users", uid, "nafsIncidents"),
  nafsIncident: (uid: string, id: string) =>
    doc(getDb(), "users", uid, "nafsIncidents", id),

  reflections: (uid: string) => collection(getDb(), "users", uid, "reflections"),
  reflection: (uid: string, id: string) => doc(getDb(), "users", uid, "reflections", id),

  interventions: (uid: string) => collection(getDb(), "users", uid, "interventions"),
  intervention: (uid: string, id: string) =>
    doc(getDb(), "users", uid, "interventions", id),

  identitySnapshots: (uid: string) =>
    collection(getDb(), "users", uid, "identitySnapshots"),

  // ── Rooms ────────────────────────────────────────────────────────────────
  rooms: () => collection(getDb(), "rooms"),
  room: (roomId: string) => doc(getDb(), "rooms", roomId),
  members: (roomId: string) => collection(getDb(), "rooms", roomId, "members"),
  member: (roomId: string, uid: string) =>
    doc(getDb(), "rooms", roomId, "members", uid),
  boardRows: (roomId: string, date: string) =>
    collection(getDb(), "rooms", roomId, "board", date, "rows"),
  boardRow: (roomId: string, date: string, uid: string) =>
    doc(getDb(), "rooms", roomId, "board", date, "rows", uid),
  feed: (roomId: string) => collection(getDb(), "rooms", roomId, "feed"),
  rollup: (roomId: string) => doc(getDb(), "rooms", roomId, "rollups", "current"),
  partnerReviews: (roomId: string) =>
    collection(getDb(), "rooms", roomId, "partnerReviews"),

  membersGroup: () => collectionGroup(getDb(), "members"),
};
