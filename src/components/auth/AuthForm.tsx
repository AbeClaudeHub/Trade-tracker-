"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Field";
import { RingMotif } from "@/components/ui/RingMotif";

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "That email and password don't match.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "An account already exists for that email.",
    "auth/weak-password": "Choose a password of at least 6 characters.",
    "auth/invalid-email": "That doesn't look like a valid email.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
  };
  return map[code] ?? (err as Error)?.message ?? "Something went wrong.";
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, configured } =
    useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignup) {
        await signUpWithEmail(email.trim().toLowerCase(), password, name.trim());
        router.push("/assessment");
      } else {
        await signInWithEmail(email.trim().toLowerCase(), password);
        router.push("/report");
      }
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      router.push(isSignup ? "/assessment" : "/report");
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      <RingMotif className="pointer-events-none absolute left-1/2 top-[-8rem] h-[30rem] w-[30rem] -translate-x-1/2 opacity-50" />
      <Link href="/" className="relative mb-9">
        <Logo />
      </Link>

      <div className="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-lift">
        <h1 className="font-serif text-title text-ink">
          {isSignup ? "Begin your diagnosis" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isSignup
            ? "Create your account. Your behavioral assessment comes next."
            : "Sign in to view your report."}
        </p>

        {!configured ? (
          <div className="mt-6 rounded-xl border border-caution/30 bg-cautionsoft px-4 py-3 text-sm text-ink">
            Firebase isn&apos;t configured yet. Add your{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_FIREBASE_*</code> keys
            (see <code className="font-mono text-xs">.env.example</code>), or try the{" "}
            <Link href="/demo" className="text-accent underline">live demo</Link>.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {isSignup ? (
            <div>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                autoComplete="name"
                required
              />
            </div>
          ) : null}
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={busy || !configured}>
            {busy ? "One moment…" : isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-faint">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleGoogle}
          disabled={busy || !configured}
        >
          Continue with Google
        </Button>

        <p className="mt-7 text-center text-sm text-muted">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to Niyyah OS?{" "}
              <Link href="/signup" className="text-accent hover:underline">
                Begin
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
