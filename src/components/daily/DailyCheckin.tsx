"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  getDaily,
  listDailies,
  postCommitments,
  postReview,
} from "@/services/dailyService";
import { listNafsIncidents, logNafsIncident } from "@/services/nafsService";
import { computeIndices, persistIndices } from "@/services/scoreService";
import { syncBoardRows } from "@/services/roomService";
import { reconcileInterventions } from "@/services/interventionService";
import { detectPatterns } from "@/domain/patterns/detect";
import { evaluateInterventions } from "@/domain/interventions/engine";
import { dominantNafs, tallyNafs } from "@/domain/nafs/analytics";
import { COMMITMENT_TEMPLATES } from "@/domain/commitments/catalog";
import { AFFIRMING_ACTIONS, BEHAVIOR_ACTIONS, VIOLATION_ACTIONS } from "@/domain/behavior/actions";
import {
  type BehaviorActionId,
  type Commitment,
  type DailyEntry,
  type LikertValue,
  type NafsCategory,
} from "@/domain/types";
import { todayKey, daysAgoKey, formatLongDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, FieldLabel } from "@/components/ui/Field";
import { NafsPicker } from "@/components/nafs/NafsPicker";
import { cn } from "@/lib/utils";

const INTENSITY: { value: LikertValue; label: string }[] = [
  { value: 1, label: "Calm" },
  { value: 2, label: "Settled" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Charged" },
  { value: 5, label: "Volatile" },
];

export function DailyCheckin() {
  const { user, profile } = useAuth();
  const date = todayKey();
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // Morning
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [feeling, setFeeling] = useState("");
  const [plan, setPlan] = useState("");
  const [sabotage, setSabotage] = useState("");
  const [intensity, setIntensity] = useState<LikertValue | null>(null);
  const [savingAm, setSavingAm] = useState(false);

  // Evening
  const [cStatus, setCStatus] = useState<Record<string, "honored" | "broken">>({});
  const [actions, setActions] = useState<BehaviorActionId[]>([]);
  const [nafsByRef, setNafsByRef] = useState<Record<string, NafsCategory[]>>({});
  const [followedRules, setFollowedRules] = useState(true);
  const [violatedRisk, setViolatedRisk] = useState(false);
  const [emotions, setEmotions] = useState(false);
  const [learned, setLearned] = useState("");
  const [savingPm, setSavingPm] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const e = await getDaily(user.uid, date);
      if (e) {
        setEntry(e);
        if (e.preMarket) {
          setFeeling(e.preMarket.feeling);
          setPlan(e.preMarket.plan);
          setSabotage(e.preMarket.sabotageRisk);
          setIntensity(e.preMarket.emotionalState);
        }
        setPicked(e.commitments.filter((c) => c.templateId).map((c) => c.templateId!));
        const status: Record<string, "honored" | "broken"> = {};
        for (const c of e.commitments) if (c.status !== "pending") status[c.id] = c.status;
        setCStatus(status);
        setActions(e.actions ?? []);
        if (e.postMarket) {
          setFollowedRules(e.postMarket.followedRules);
          setViolatedRisk(e.postMarket.violatedRisk);
          setEmotions(e.postMarket.emotionsAffectedDecisions);
          setLearned(e.postMarket.learned);
        }
      }
      setLoading(false);
    })();
  }, [user, date]);

  const committed = Boolean(entry?.committedAt);
  const reviewed = Boolean(entry?.reviewedAt);

  // The "breaches" that need a root cause: violations + broken commitments.
  const breaches = useMemo(() => {
    const list: { ref: string; label: string; suggested: NafsCategory[] }[] = [];
    for (const a of actions) {
      const action = BEHAVIOR_ACTIONS[a];
      if (action?.isViolation) {
        list.push({ ref: a, label: action.label, suggested: action.nafsHints ?? [] });
      }
    }
    for (const c of entry?.commitments ?? []) {
      if (cStatus[c.id] === "broken") {
        list.push({ ref: `commitment:${c.id}`, label: `Broke: ${c.text}`, suggested: c.nafsTags });
      }
    }
    return list;
  }, [actions, cStatus, entry]);

  async function refreshDerived(updated: DailyEntry) {
    if (!user || !profile) return;
    const [history, incidents] = await Promise.all([
      listDailies(user.uid, daysAgoKey(120)),
      listNafsIncidents(user.uid, daysAgoKey(120)),
    ]);
    const merged = [...history.filter((d) => d.date !== updated.date), updated];
    const indices = computeIndices(merged, incidents, date);
    await persistIndices(user.uid, indices);

    const recent = merged.filter((e) => e.reviewedAt).slice(-5).map((e) => e.dayScore);
    const trend =
      recent.length >= 2 && recent[recent.length - 1]! > recent[0]!
        ? "up"
        : recent.length >= 2 && recent[recent.length - 1]! < recent[0]!
          ? "down"
          : "flat";
    const topNafs = dominantNafs(tallyNafs(incidents, daysAgoKey(30)));

    if (profile.roomIds.length > 0) {
      await syncBoardRows({ profile, date, entry: updated, indices, trend, topNafs });
    }

    // Evaluate interventions after a completed review.
    if (updated.reviewedAt) {
      const patterns = detectPatterns(merged, incidents);
      const drafts = evaluateInterventions({ entries: merged, patterns, todayIso: date });
      await reconcileInterventions(user.uid, drafts).catch(() => {});
    }
  }

  async function saveMorning() {
    if (!user || intensity === null) return;
    setSavingAm(true);
    const commitments: Commitment[] = [
      ...picked.map((id) => {
        const t = COMMITMENT_TEMPLATES.find((x) => x.id === id)!;
        return {
          id,
          templateId: id,
          text: t.label,
          mappedViolation: t.mappedViolation,
          nafsTags: t.nafsHints,
          status: "pending" as const,
        };
      }),
      ...(custom.trim()
        ? [
            {
              id: `custom-${Date.now()}`,
              templateId: null,
              text: custom.trim(),
              nafsTags: [] as NafsCategory[],
              status: "pending" as const,
            },
          ]
        : []),
    ];
    const updated = await postCommitments(user.uid, date, commitments, {
      feeling,
      plan,
      sabotageRisk: sabotage,
      emotionalState: intensity,
    });
    setEntry(updated);
    setCustom("");
    await refreshDerived(updated);
    setSavingAm(false);
  }

  function toggleAction(id: BehaviorActionId) {
    setActions((p) => (p.includes(id) ? p.filter((a) => a !== id) : [...p, id]));
  }

  async function saveEvening() {
    if (!user) return;
    setSavingPm(true);
    const updated = await postReview(
      user.uid,
      date,
      cStatus,
      actions,
      {
        followedRules,
        violatedRisk,
        emotionsAffectedDecisions: emotions,
        learned,
      },
    );
    setEntry(updated);

    // Log a nafs incident per breach that has a root cause selected.
    await Promise.all(
      breaches
        .filter((b) => (nafsByRef[b.ref] ?? []).length > 0)
        .map((b) =>
          logNafsIncident(user.uid, {
            date,
            categories: nafsByRef[b.ref]!,
            sourceType: b.ref.startsWith("commitment:") ? "brokenCommitment" : "violation",
            sourceRef: b.ref,
          }),
        ),
    );

    await refreshDerived(updated);
    setSavingPm(false);
  }

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow={formatLongDate(date)}
        title="Today's accountability"
        description="Commit before the session. Review after. This is the engine of change."
      />

      {/* MORNING — COMMITMENTS */}
      <Card className="mb-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Before the session — commit</h2>
          {committed ? (
            <span className="rounded-full bg-affirmsoft px-2.5 py-1 text-xs font-medium text-affirm">
              Committed
            </span>
          ) : null}
        </div>

        <p className="label mb-3">Today I commit to</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {COMMITMENT_TEMPLATES.map((t) => {
            const active = picked.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setPicked((p) => (active ? p.filter((x) => x !== t.id) : [...p, t.id]))
                }
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                  active ? "border-accent bg-accent-soft" : "border-line bg-surface hover:bg-raised",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    active ? "border-accent bg-accent" : "border-line-strong",
                  )}
                >
                  {active ? <span className="h-2 w-2 rounded-sm bg-white" /> : null}
                </span>
                <span>
                  <span className="block text-[15px] font-medium text-ink">{t.label}</span>
                  <span className="text-xs text-muted">{t.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="custom">Add your own commitment</FieldLabel>
          <Textarea
            id="custom"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Make it specific and measurable."
            className="min-h-[60px]"
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>How do I feel today?</FieldLabel>
            <Textarea value={feeling} onChange={(e) => setFeeling(e.target.value)} className="min-h-[60px]" />
          </div>
          <div>
            <FieldLabel>My plan</FieldLabel>
            <Textarea value={plan} onChange={(e) => setPlan(e.target.value)} className="min-h-[60px]" />
          </div>
          <div>
            <FieldLabel>What could sabotage me?</FieldLabel>
            <Textarea value={sabotage} onChange={(e) => setSabotage(e.target.value)} className="min-h-[60px]" />
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel>Emotional state at the open</FieldLabel>
          <div className="grid grid-cols-5 gap-2">
            {INTENSITY.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntensity(opt.value)}
                className={cn(
                  "rounded-xl border px-2 py-2.5 text-center text-xs transition-all",
                  intensity === opt.value
                    ? "border-accent bg-accent-soft text-accent-ink"
                    : "border-line bg-surface text-muted hover:bg-raised",
                )}
              >
                <span className="block font-serif text-base text-ink">{opt.value}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={saveMorning} disabled={savingAm || intensity === null || (picked.length === 0 && !custom.trim())}>
            {savingAm ? "Saving…" : committed ? "Update commitments" : "Lock in my commitments"}
          </Button>
        </div>
      </Card>

      {/* EVENING — REVIEW */}
      <Card className={cn(!committed && "opacity-60")}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">After the session — review</h2>
          {reviewed ? (
            <span className="rounded-full bg-affirmsoft px-2.5 py-1 text-xs font-medium text-affirm">
              Reviewed
            </span>
          ) : null}
        </div>

        {!committed ? (
          <p className="text-sm text-muted">Commit to your day first. Intention comes before review.</p>
        ) : (
          <>
            {entry!.commitments.length > 0 ? (
              <>
                <p className="label mb-3">Did you honor each commitment?</p>
                <div className="space-y-2.5">
                  {entry!.commitments.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                      <span className="text-[15px] text-ink">{c.text}</span>
                      <div className="flex gap-2">
                        {(["honored", "broken"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCStatus((p) => ({ ...p, [c.id]: s }))}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-sm transition-all",
                              cStatus[c.id] === s
                                ? s === "honored"
                                  ? "border-affirm/50 bg-affirmsoft text-affirm"
                                  : "border-breach/50 bg-breachsoft text-breach"
                                : "border-line text-muted hover:bg-raised",
                            )}
                          >
                            {s === "honored" ? "Honored" : "Broke"}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <p className="label mb-3 mt-6">What did you do well?</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {AFFIRMING_ACTIONS.map((a) => (
                <ActionChip key={a.id} id={a.id} label={a.label} points={a.points} tone="affirm" selected={actions.includes(a.id)} onToggle={() => toggleAction(a.id)} />
              ))}
            </div>

            <p className="label mb-3 mt-6">Where did you break?</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {VIOLATION_ACTIONS.map((a) => (
                <ActionChip key={a.id} id={a.id} label={a.label} points={a.points} tone="breach" selected={actions.includes(a.id)} onToggle={() => toggleAction(a.id)} />
              ))}
            </div>

            {/* NAFS — root cause of each breach */}
            {breaches.length > 0 ? (
              <div className="mt-6 rounded-xl border border-breach/20 bg-breachsoft/40 p-4">
                <p className="label mb-1">The Nafs behind it</p>
                <p className="mb-4 text-xs text-muted">
                  Trades are symptoms. Name the internal driver behind each breach.
                </p>
                <div className="space-y-4">
                  {breaches.map((b) => (
                    <div key={b.ref}>
                      <p className="mb-2 text-sm font-medium text-ink">{b.label}</p>
                      <NafsPicker
                        selected={nafsByRef[b.ref] ?? []}
                        suggested={b.suggested}
                        onChange={(next) => setNafsByRef((p) => ({ ...p, [b.ref]: next }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <FieldLabel>What did you learn?</FieldLabel>
              <Textarea value={learned} onChange={(e) => setLearned(e.target.value)} placeholder="One honest sentence is enough." />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={saveEvening} disabled={savingPm}>
                {savingPm ? "Saving…" : reviewed ? "Update review" : "Close the day"}
              </Button>
              {reviewed ? <span className="text-sm text-muted">Saved. Your room can see you followed through.</span> : null}
            </div>
          </>
        )}
      </Card>
    </Page>
  );
}

function ActionChip({
  label,
  points,
  selected,
  onToggle,
  tone,
}: {
  id: BehaviorActionId;
  label: string;
  points: number;
  selected: boolean;
  onToggle: () => void;
  tone: "affirm" | "breach";
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
        selected
          ? tone === "affirm"
            ? "border-affirm/50 bg-affirmsoft"
            : "border-breach/50 bg-breachsoft"
          : "border-line bg-surface hover:bg-raised",
      )}
    >
      <span className="text-[15px] font-medium text-ink">{label}</span>
      <span className={cn("text-xs font-medium tabular-nums", tone === "affirm" ? "text-affirm" : "text-breach")}>
        {points > 0 ? `+${points}` : points}
      </span>
    </button>
  );
}
