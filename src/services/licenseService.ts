import { getDoc, runTransaction } from "firebase/firestore";
import type { Entitlement, LicenseCode } from "@/domain/types";
import { getDb } from "@/lib/firebase/client";
import { isDemoMode } from "@/lib/demo/isDemo";
import { paths } from "./collections";

/**
 * Redeem a one-time license code. Codes are issued by the community owner and
 * stored in `licenseCodes`. Redemption is transactional so a code can't be used
 * twice.
 */
export async function redeemCode(uid: string, raw: string): Promise<Entitlement> {
  const code = raw.trim().toUpperCase();
  if (!code) throw new Error("Enter your access code.");
  if (isDemoMode()) {
    return { unlocked: true, codeRedeemed: "DEMO", redeemedAt: new Date().toISOString() };
  }

  const db = getDb();
  const now = new Date().toISOString();

  await runTransaction(db, async (tx) => {
    const codeRef = paths.licenseCode(code);
    const codeSnap = await tx.get(codeRef);
    if (!codeSnap.exists()) throw new Error("That code isn't valid.");
    const data = codeSnap.data() as LicenseCode;
    if (data.used && data.usedBy !== uid) {
      throw new Error("That code has already been used.");
    }
    tx.set(codeRef, { used: true, usedBy: uid, usedAt: now }, { merge: true });
    tx.set(
      paths.user(uid),
      {
        entitlement: { unlocked: true, codeRedeemed: code, redeemedAt: now },
      },
      { merge: true },
    );
  });

  return { unlocked: true, codeRedeemed: code, redeemedAt: now };
}

export async function isUnlocked(uid: string): Promise<boolean> {
  if (isDemoMode()) return true;
  const snap = await getDoc(paths.user(uid));
  return Boolean(snap.exists() && snap.data().entitlement?.unlocked);
}
