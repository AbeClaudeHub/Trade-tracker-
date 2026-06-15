"use client";

import { useState } from "react";
import Link from "next/link";
import { updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth/AuthProvider";
import { paths } from "@/services/collections";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function SettingsView() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.displayName ?? "");
  const [shareScore, setShareScore] = useState(
    profile?.partnerVisibility.behaviorScore ?? true,
  );
  const [shareReflections, setShareReflections] = useState(
    profile?.partnerVisibility.reflections ?? false,
  );
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (!user) return;
    setBusy(true);
    setSaved(false);
    await updateDoc(paths.user(user.uid), {
      displayName: name.trim() || "Trader",
      partnerVisibility: {
        behaviorScore: shareScore,
        reflections: shareReflections,
      },
    });
    await refreshProfile();
    setBusy(false);
    setSaved(true);
  }

  return (
    <Page className="max-w-2xl">
      <PageHeader eyebrow="Settings" title="Your account" />

      <Card className="mb-6">
        <FieldLabel htmlFor="name">Display name</FieldLabel>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="mt-2 text-xs text-faint">
          Signed in as {profile?.email ?? user?.email}
        </p>
      </Card>

      <Card className="mb-6">
        <h3 className="font-serif text-lg text-ink">Partner visibility</h3>
        <p className="mt-1 text-sm text-muted">
          You control exactly what an accountability partner can see. Nothing is
          shared unless you choose it.
        </p>
        <div className="mt-3 divide-y divide-line">
          <Toggle
            label="Share my behavior score"
            description="Your weekly behavior score and clean-day streak."
            checked={shareScore}
            onChange={setShareScore}
          />
          <Toggle
            label="Share my reflections"
            description="Your weekly commitment, shown to your partner."
            checked={shareReflections}
            onChange={setShareReflections}
          />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        {saved ? <span className="text-sm text-affirm">Saved.</span> : null}
      </div>

      <Card className="mt-8">
        <h3 className="font-serif text-lg text-ink">Reassess</h3>
        <p className="mt-1 text-sm text-muted">
          Behavior changes. Retake the assessment to see how your archetype has
          shifted.
        </p>
        <Link href="/assessment" className="mt-4 inline-block">
          <Button variant="secondary">Retake the assessment</Button>
        </Link>
      </Card>
    </Page>
  );
}
