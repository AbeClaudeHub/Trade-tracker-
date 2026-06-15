"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getDaily, savePreMarket, savePostMarket } from "@/services/dailyService";
import { AFFIRMING_ACTIONS, VIOLATION_ACTIONS } from "@/domain/behavior/actions";
import { scoreActions } from "@/domain/behavior/scoring";
import {
  type BehaviorActionId,
  type DailyEntry,
  type LikertValue,
} from "@/domain/types";
import { todayKey, formatLongDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, FieldLabel } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const INTENSITY: { value: LikertValue; label: string }[] = [
  { value: 1, label: "Calm" },
  { value: 2, label: "Settled" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Charged" },
  { value: 5, label: "Volatile" },
];

function ActionChip({
  label,
  description,
  points,
  selected,
  onToggle,
  tone,
}: {
  label: string;
  description: string;
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
        "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
        selected
          ? tone === "affirm"
            ? "border-affirm/50 bg-affirmsoft"
            : "border-breach/50 bg-breachsoft"
          : "border-line bg-surface hover:bg-raised",
      )}
    >
      <span>
        <span className="text-[15px] font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
          {description}
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
          tone === "affirm" ? "text-affirm" : "text-breach",
        )}
      >
        {points > 0 ? `+${points}` : points}
      </span>
    </button>
  );
}

export function DailyCheckin() {
  const { user } = useAuth();
  const date = todayKey();
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // Pre-market
  const [feeling, setFeeling] = useState("");
  const [plan, setPlan] = useState("");
  const [sabotage, setSabotage] = useState("");
  const [intensity, setIntensity] = useState<LikertValue | null>(null);
  const [savingPre, setSavingPre] = useState(false);

  // Post-market
  const [actions, setActions] = useState<BehaviorActionId[]>([]);
  const [followedRules, setFollowedRules] = useState<boolean | null>(null);
  const [violatedRisk, setViolatedRisk] = useState<boolean | null>(null);
  const [emotionsAffected, setEmotionsAffected] = useState<boolean | null>(null);
  const [learned, setLearned] = useState("");
  const [savingPost, setSavingPost] = useState(false);

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
        if (e.postMarket) {
          setFollowedRules(e.postMarket.followedRules);
          setViolatedRisk(e.postMarket.violatedRisk);
          setEmotionsAffected(e.postMarket.emotionsAffectedDecisions);
          setLearned(e.postMarket.learned);
        }
        setActions(e.actions ?? []);
      }
      setLoading(false);
    })();
  }, [user, date]);

  function toggle(id: BehaviorActionId) {
    setActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  async function handleSavePre() {
    if (!user || intensity === null) return;
    setSavingPre(true);
    const updated = await savePreMarket(user.uid, date, {
      feeling,
      plan,
      sabotageRisk: sabotage,
      emotionalState: intensity,
    });
    setEntry(updated);
    setSavingPre(false);
  }

  async function handleSavePost() {
    if (!user) return;
    setSavingPost(true);
    const updated = await savePostMarket(
      user.uid,
      date,
      {
        followedRules: followedRules ?? false,
        violatedRisk: violatedRisk ?? false,
        emotionsAffectedDecisions: emotionsAffected ?? false,
        learned,
      },
      actions,
    );
    setEntry(updated);
    setSavingPost(false);
  }

  const liveScore = scoreActions(actions);
  const preComplete = Boolean(entry?.preMarket);
  const postComplete = Boolean(entry?.postMarket);

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
        description="Two minutes before the open. Two minutes after the close. That's the whole practice."
      />

      {/* PRE-MARKET */}
      <Card className="mb-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Before the session</h2>
          {preComplete ? (
            <span className="rounded-full bg-affirmsoft px-2.5 py-1 text-xs font-medium text-affirm">
              Logged
            </span>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            <FieldLabel>How do I feel today?</FieldLabel>
            <Textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="Name the emotion before it names your trades."
            />
          </div>
          <div>
            <FieldLabel>What is my plan?</FieldLabel>
            <Textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="What will you do — and just as importantly, what won't you do?"
            />
          </div>
          <div>
            <FieldLabel>What could sabotage me today?</FieldLabel>
            <Textarea
              value={sabotage}
              onChange={(e) => setSabotage(e.target.value)}
              placeholder="Name the trap before you walk into it."
            />
          </div>
          <div>
            <FieldLabel>Emotional state at the open</FieldLabel>
            <div className="grid grid-cols-5 gap-2">
              {INTENSITY.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIntensity(opt.value)}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-center text-xs transition-all",
                    intensity === opt.value
                      ? "border-accent bg-accent-soft text-accent-ink"
                      : "border-line bg-surface text-muted hover:bg-raised",
                  )}
                >
                  <span className="block font-serif text-lg text-ink">{opt.value}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleSavePre} disabled={savingPre || intensity === null}>
            {savingPre ? "Saving…" : preComplete ? "Update morning check-in" : "Log my intention"}
          </Button>
        </div>
      </Card>

      {/* POST-MARKET */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">After the session</h2>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
              liveScore > 0
                ? "bg-affirmsoft text-affirm"
                : liveScore < 0
                  ? "bg-breachsoft text-breach"
                  : "bg-sand text-muted",
            )}
          >
            Today: {liveScore > 0 ? `+${liveScore}` : liveScore}
          </span>
        </div>

        <p className="label mb-3">What did I do well?</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {AFFIRMING_ACTIONS.map((a) => (
            <ActionChip
              key={a.id}
              label={a.label}
              description={a.description}
              points={a.points}
              tone="affirm"
              selected={actions.includes(a.id)}
              onToggle={() => toggle(a.id)}
            />
          ))}
        </div>

        <p className="label mb-3 mt-6">Where did I break?</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {VIOLATION_ACTIONS.map((a) => (
            <ActionChip
              key={a.id}
              label={a.label}
              description={a.description}
              points={a.points}
              tone="breach"
              selected={actions.includes(a.id)}
              onToggle={() => toggle(a.id)}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <YesNo label="Did I follow my rules?" value={followedRules} onChange={setFollowedRules} good="yes" />
          <YesNo label="Did I violate risk?" value={violatedRisk} onChange={setViolatedRisk} good="no" />
          <YesNo
            label="Did emotions drive decisions?"
            value={emotionsAffected}
            onChange={setEmotionsAffected}
            good="no"
          />
        </div>

        <div className="mt-6">
          <FieldLabel>What did I learn?</FieldLabel>
          <Textarea
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            placeholder="One honest sentence is enough."
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSavePost} disabled={savingPost}>
            {savingPost ? "Saving…" : postComplete ? "Update review" : "Close the day"}
          </Button>
          {postComplete ? (
            <span className="text-sm text-muted">Saved. Rest well — tomorrow you go again.</span>
          ) : null}
        </div>
      </Card>
    </Page>
  );
}

function YesNo({
  label,
  value,
  onChange,
  good,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  good: "yes" | "no";
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="mb-2 text-sm text-ink">{label}</p>
      <div className="flex gap-2">
        {[true, false].map((v) => {
          const isGood = (good === "yes") === v;
          const active = value === v;
          return (
            <button
              key={String(v)}
              type="button"
              onClick={() => onChange(v)}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-sm transition-all",
                active
                  ? isGood
                    ? "border-affirm/50 bg-affirmsoft text-affirm"
                    : "border-breach/50 bg-breachsoft text-breach"
                  : "border-line text-muted hover:bg-raised",
              )}
            >
              {v ? "Yes" : "No"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
