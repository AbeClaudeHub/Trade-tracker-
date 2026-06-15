"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  getFirebaseAuth,
  getDb,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import type { UserProfile } from "@/domain/types";
import { isDemoMode, disableDemo } from "@/lib/demo/isDemo";
import { demo, DEMO_USER } from "@/lib/demo/store";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(user: User): Promise<UserProfile> {
  const db = getDb();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? (user.email?.split("@")[0] ?? "Trader"),
    createdAt: new Date().toISOString(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    assessmentCompleted: false,
    archetypeId: null,
    baselineArchetypeId: null,
    roomIds: [],
  };
  await setDoc(ref, { ...profile, _createdAt: serverTimestamp() });
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo mode: bypass Firebase entirely with a seeded user + profile.
    if (isDemoMode()) {
      setUser({ uid: DEMO_USER.uid, email: DEMO_USER.email, displayName: DEMO_USER.displayName } as unknown as User);
      setProfile(demo().profile);
      setLoading(false);
      return;
    }
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          setProfile(await ensureProfile(u));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    if (isDemoMode()) {
      setProfile({ ...demo().profile });
      return;
    }
    if (!user) return;
    const snap = await getDoc(doc(getDb(), "users", user.uid));
    if (snap.exists()) setProfile(snap.data() as UserProfile);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured: isFirebaseConfigured || isDemoMode(),
      async signUpWithEmail(email, password, name) {
        const auth = getFirebaseAuth();
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        setProfile(await ensureProfile(cred.user));
      },
      async signInWithEmail(email, password) {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      async signInWithGoogle() {
        const cred = await signInWithPopup(getFirebaseAuth(), googleProvider);
        setProfile(await ensureProfile(cred.user));
      },
      async signOut() {
        if (isDemoMode()) {
          disableDemo();
          setUser(null);
          setProfile(null);
          return;
        }
        await fbSignOut(getFirebaseAuth());
      },
      refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
