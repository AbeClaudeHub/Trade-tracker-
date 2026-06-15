import { collection, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

/**
 * Firestore paths (v3). The product is near-stateless: a user, their single
 * generated report, and owner-issued license codes.
 */
export const paths = {
  user: (uid: string) => doc(getDb(), "users", uid),
  report: (uid: string) => doc(getDb(), "users", uid, "report", "current"),
  licenseCodes: () => collection(getDb(), "licenseCodes"),
  licenseCode: (code: string) => doc(getDb(), "licenseCodes", code),
};
