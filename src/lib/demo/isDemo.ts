/**
 * Demo mode lets anyone explore the full product with no sign-up and no
 * Firebase — backed by a seeded in-memory store.
 *
 * Enabled either by:
 *  - build-time env `NEXT_PUBLIC_DEMO=1` (whole deployment is a demo), or
 *  - a client flag set by visiting `/demo` (stored in localStorage).
 */
export const DEMO_FLAG = "niyyah-demo";

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO === "1") return true;
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEMO_FLAG) === "1";
  } catch {
    return false;
  }
}

export function enableDemo() {
  try {
    window.localStorage.setItem(DEMO_FLAG, "1");
  } catch {
    /* ignore */
  }
}

export function disableDemo() {
  try {
    window.localStorage.removeItem(DEMO_FLAG);
  } catch {
    /* ignore */
  }
}
