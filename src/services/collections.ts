import { collection, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

/**
 * Centralised Firestore paths. Per-user data lives under `users/{uid}/...`
 * so security rules can scope access to the owner by default.
 */
export const paths = {
  user: (uid: string) => doc(getDb(), "users", uid),
  users: () => collection(getDb(), "users"),

  assessments: (uid: string) => collection(getDb(), "users", uid, "assessments"),
  assessment: (uid: string, id: string) =>
    doc(getDb(), "users", uid, "assessments", id),

  dailies: (uid: string) => collection(getDb(), "users", uid, "dailies"),
  daily: (uid: string, id: string) => doc(getDb(), "users", uid, "dailies", id),

  reflections: (uid: string) => collection(getDb(), "users", uid, "reflections"),
  reflection: (uid: string, id: string) =>
    doc(getDb(), "users", uid, "reflections", id),

  partnerLinks: () => collection(getDb(), "partnerLinks"),
  partnerLink: (id: string) => doc(getDb(), "partnerLinks", id),
  feedback: () => collection(getDb(), "partnerFeedback"),
};
