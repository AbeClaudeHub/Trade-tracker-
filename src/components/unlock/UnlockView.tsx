"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { redeemCode } from "@/services/licenseService";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Field";

export function UnlockView() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyUnlocked = Boolean(profile?.entitlement.unlocked);

  async function handleRedeem() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await redeemCode(user.uid, code);
      await refreshProfile();
      router.push("/report");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Page className="max-w-lg">
      {alreadyUnlocked ? (
        <Card variant="gold" className="grain text-center" inset>
          <p className="font-serif text-2xl text-ink">You&apos;re unlocked.</p>
          <p className="mt-2 text-muted">Your full report and 30-day blueprint are ready.</p>
          <Button variant="gold" className="mt-6" onClick={() => router.push("/report")}>
            Open my report
          </Button>
        </Card>
      ) : (
        <Card variant="gold" className="grain overflow-hidden" inset>
          <div className="text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-line/60 bg-surface text-gold-ink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <h1 className="mt-5 font-serif text-2xl text-ink">Unlock your full report</h1>
            <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
              Niyyah OS is a one-time purchase. Your community provides an access
              code — redeem it to unlock your diagnosis and 30-day blueprint.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-gold-line/40 bg-surface/70 p-5">
            <FieldLabel htmlFor="code">Access code</FieldLabel>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="NIYYAH-XXXX"
              className="text-center font-mono uppercase tracking-[0.2em]"
            />
            {error ? (
              <p className="mt-3 rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">{error}</p>
            ) : null}
            <Button
              variant="gold"
              size="lg"
              className="mt-4 w-full"
              onClick={handleRedeem}
              disabled={busy || !code.trim()}
            >
              {busy ? "Verifying…" : "Unlock my report"}
            </Button>
          </div>

          <p className="mt-5 text-center text-xs text-faint">
            Don&apos;t have a code? Ask your community owner where to purchase access.
          </p>
        </Card>
      )}
    </Page>
  );
}
