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

export function SettingsView() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.displayName ?? "");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (!user) return;
    setBusy(true);
    setSaved(false);
    await updateDoc(paths.user(user.uid), {
      displayName: name.trim() || "Trader",
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
          This is what your accountability room sees. Signed in as{" "}
          {profile?.email ?? user?.email}.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
          {saved ? <span className="text-sm text-affirm">Saved.</span> : null}
        </div>
      </Card>

      <Card className="mb-6">
        <h3 className="font-serif text-lg text-ink">Room visibility</h3>
        <p className="mt-1 text-sm text-muted">
          Per-room sharing of your score, nafs battles, and reflections is managed
          inside each room. You control exactly what each room can see — and PnL is
          never tracked anywhere, so it can never be shared.
        </p>
        <Link href="/rooms" className="mt-4 inline-block">
          <Button variant="secondary">Manage rooms</Button>
        </Link>
      </Card>

      <Card>
        <h3 className="font-serif text-lg text-ink">Reassess</h3>
        <p className="mt-1 text-sm text-muted">
          Behavior changes. Retake the assessment to see how far you&apos;ve moved
          from your starting archetype.
        </p>
        <Link href="/assessment" className="mt-4 inline-block">
          <Button variant="secondary">Retake the assessment</Button>
        </Link>
      </Card>
    </Page>
  );
}
