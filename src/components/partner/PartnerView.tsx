"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  endPartnership,
  findUserByEmail,
  getMyLink,
  getPartnerProfile,
  listFeedback,
  requestPartner,
  respondToRequest,
  sendFeedback,
} from "@/services/partnerService";
import { getArchetype } from "@/domain/archetypes/engine";
import type { PartnerFeedback, PartnerLink, UserProfile } from "@/domain/types";
import { weekStartKey, formatShortDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, FieldLabel } from "@/components/ui/Field";

export function PartnerView() {
  const { user } = useAuth();
  const [link, setLink] = useState<PartnerLink | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [feedback, setFeedback] = useState<PartnerFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const myLink = await getMyLink(user.uid);
    setLink(myLink);
    if (myLink) {
      const partnerUid = myLink.members.find((m) => m !== user.uid)!;
      const [profile, fb] = await Promise.all([
        getPartnerProfile(partnerUid),
        listFeedback(myLink.id),
      ]);
      setPartner(profile);
      setFeedback(fb);
    } else {
      setPartner(null);
      setFeedback([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite() {
    if (!user || !email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const target = await findUserByEmail(email.trim().toLowerCase());
      if (!target) throw new Error("No Niyyah OS member found with that email.");
      if (target.uid === user.uid) throw new Error("You can't partner with yourself.");
      await requestPartner(user.uid, target.uid);
      setEmail("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function respond(accept: boolean) {
    if (!link) return;
    setBusy(true);
    await respondToRequest(link.id, accept);
    await load();
    setBusy(false);
  }

  async function handleEnd() {
    if (!link) return;
    setBusy(true);
    await endPartnership(link.id);
    setLink(null);
    setPartner(null);
    setBusy(false);
  }

  async function handleSendFeedback() {
    if (!user || !link || !message.trim()) return;
    setBusy(true);
    await sendFeedback(link, user.uid, weekStartKey(), message.trim());
    setMessage("");
    await load();
    setBusy(false);
  }

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  // ── No partner: invite ────────────────────────────────────────────────
  if (!link) {
    return (
      <Page className="max-w-2xl">
        <PageHeader
          eyebrow="Accountability partner"
          title="One person who sees your behavior"
          description="Not a network. Not a feed. A single accountability partner who can see your behavior score and your reflections — and who you can see in return."
        />
        <Card>
          <FieldLabel htmlFor="invite">Invite by email</FieldLabel>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="invite"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              className="flex-1"
            />
            <Button onClick={handleInvite} disabled={busy || !email.trim()}>
              {busy ? "Sending…" : "Send request"}
            </Button>
          </div>
          {error ? (
            <p className="mt-3 rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">
              {error}
            </p>
          ) : null}
          <p className="mt-4 text-xs leading-relaxed text-faint">
            They must already have a Niyyah OS account. You control exactly what
            they can see in Settings.
          </p>
        </Card>
      </Page>
    );
  }

  // ── Pending ───────────────────────────────────────────────────────────
  if (link.status === "pending") {
    const iRequested = link.requestedBy === user?.uid;
    return (
      <Page className="max-w-2xl">
        <PageHeader eyebrow="Accountability partner" title="Request pending" />
        <Card>
          {iRequested ? (
            <p className="text-muted">
              Your request has been sent. Once {partner?.displayName ?? "they"}{" "}
              accept, you&apos;ll both be able to see each other&apos;s behavior.
            </p>
          ) : (
            <>
              <p className="text-ink">
                <span className="font-medium">
                  {partner?.displayName ?? "A trader"}
                </span>{" "}
                invited you to be accountability partners.
              </p>
              <div className="mt-4 flex gap-3">
                <Button onClick={() => respond(true)} disabled={busy}>
                  Accept
                </Button>
                <Button variant="secondary" onClick={() => respond(false)} disabled={busy}>
                  Decline
                </Button>
              </div>
            </>
          )}
        </Card>
      </Page>
    );
  }

  // ── Active ────────────────────────────────────────────────────────────
  const archetype = partner?.archetypeId ? getArchetype(partner.archetypeId) : null;
  const shared = partner?.sharedSummary;

  return (
    <Page>
      <PageHeader
        eyebrow="Accountability partner"
        title={partner?.displayName ?? "Your partner"}
        description={archetype ? `Tracked as ${archetype.name}.` : undefined}
        action={
          <Button variant="secondary" size="sm" onClick={handleEnd} disabled={busy}>
            End partnership
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="label mb-4">Their progress</h3>
          {shared?.weeklyScore !== undefined ? (
            <div className="space-y-4">
              <div>
                <p className="font-serif text-3xl text-ink">
                  {shared.weeklyScore > 0 ? `+${shared.weeklyScore}` : shared.weeklyScore}
                </p>
                <p className="text-xs text-faint">behavior score this week</p>
              </div>
              {shared.streak !== undefined ? (
                <div>
                  <p className="font-serif text-2xl text-ink">{shared.streak}</p>
                  <p className="text-xs text-faint">clean-day streak</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              They haven&apos;t shared their behavior score, or haven&apos;t
              reflected yet this week.
            </p>
          )}
          {shared?.lastReflectionExcerpt ? (
            <div className="mt-5 border-t border-line pt-4">
              <p className="label mb-1">Their commitment</p>
              <p className="text-sm leading-relaxed text-ink/90">
                {shared.lastReflectionExcerpt}
              </p>
            </div>
          ) : null}
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="label mb-4">Weekly feedback</h3>
          <div className="flex flex-col gap-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Be honest and specific. Accountability is a gift, not a comfort."
            />
            <div>
              <Button onClick={handleSendFeedback} disabled={busy || !message.trim()}>
                Send feedback
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {feedback.length === 0 ? (
              <p className="text-sm text-muted">No feedback exchanged yet.</p>
            ) : (
              feedback.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-line bg-raised p-4"
                >
                  <p className="mb-1 text-xs text-faint">
                    {f.fromUserId === user?.uid ? "You" : partner?.displayName ?? "Partner"}{" "}
                    · week of {formatShortDate(f.weekStart)}
                  </p>
                  <p className="text-sm leading-relaxed text-ink/90">{f.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}
