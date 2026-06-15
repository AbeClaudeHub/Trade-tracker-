"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { redeemCode } from "@/services/licenseService";
import { Page, PageHeader } from "@/components/layout/Page";
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
      <PageHeader
        eyebrow="Unlock"
        title="Enter your access code"
        description="Niyyah OS is a one-time purchase. Your community provides an access code — redeem it here to unlock your full report and 30-day blueprint."
      />

      {alreadyUnlocked ? (
        <Card className="text-center">
          <p className="text-ink">Your report is already unlocked.</p>
          <Button className="mt-4" onClick={() => router.push("/report")}>
            Open my report
          </Button>
        </Card>
      ) : (
        <Card>
          <FieldLabel htmlFor="code">Access code</FieldLabel>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. NIYYAH-XXXX"
            className="font-mono uppercase"
          />
          {error ? (
            <p className="mt-3 rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">{error}</p>
          ) : null}
          <Button className="mt-4 w-full" size="lg" onClick={handleRedeem} disabled={busy || !code.trim()}>
            {busy ? "Verifying…" : "Unlock my report"}
          </Button>
          <p className="mt-4 text-center text-xs text-faint">
            Don&apos;t have a code? Ask your community owner where to purchase access.
          </p>
        </Card>
      )}
    </Page>
  );
}
