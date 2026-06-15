"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  getReflection,
  listReflections,
  saveReflection,
  saveReflectionSummary,
} from "@/services/reflectionService";
import { listDailies } from "@/services/dailyService";
import { updateSharedSummary } from "@/services/partnerService";
import { consistencyStreak, summarizeWindow } from "@/domain/behavior/scoring";
import type { WeeklyReflection } from "@/domain/types";
import { todayKey, weekId, weekStartKey, formatShortDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, FieldLabel } from "@/components/ui/Field";

const PROMPTS: {
  key: keyof Pick<WeeklyReflection, "improved" | "repeated" | "triggers" | "nextWeek">;
  label: string;
  placeholder: string;
}[] = [
  { key: "improved", label: "What improved this week?", placeholder: "Name the growth, however small." },
  { key: "repeated", label: "What repeated?", placeholder: "The mistake you keep returning to." },
  { key: "triggers", label: "What triggered your mistakes?", placeholder: "The conditions, emotions, or moments behind them." },
  { key: "nextWeek", label: "What will you change next week?", placeholder: "One specific, behavioral commitment." },
];

export function ReflectionView() {
  const { user, profile } = useAuth();
  const [fields, setFields] = useState({ improved: "", repeated: "", triggers: "", nextWeek: "" });
  const [history, setHistory] = useState<WeeklyReflection[]>([]);
  const [summary, setSummary] = useState("");
  const [context, setContext] = useState({ score: 0, violations: 0, streak: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const weekStart = weekStartKey();
      const [current, all, weekDailies] = await Promise.all([
        getReflection(user.uid),
        listReflections(user.uid),
        listDailies(user.uid, weekStart),
      ]);
      if (current) {
        setFields({
          improved: current.improved,
          repeated: current.repeated,
          triggers: current.triggers,
          nextWeek: current.nextWeek,
        });
        if (current.summary) setSummary(current.summary);
      }
      setHistory(all);
      const window = summarizeWindow(weekDailies);
      setContext({
        score: window.total,
        violations: window.violations,
        streak: consistencyStreak(weekDailies, todayKey()),
      });
      setLoading(false);
    })();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const saved = await saveReflection(user.uid, fields);

    // Generate an AI summary of the week (graceful if AI is unconfigured).
    try {
      const res = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection: saved, context }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        await saveReflectionSummary(user.uid, saved.id, data.summary);
        saved.summary = data.summary;
      }
    } catch {
      /* ignore */
    }

    // Share a consent-gated excerpt with an accountability partner.
    if (profile) {
      updateSharedSummary(user.uid, profile.partnerVisibility, {
        weeklyScore: context.score,
        streak: context.streak,
        lastReflectionExcerpt: fields.nextWeek,
      }).catch(() => {});
    }

    setHistory((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
    setSaving(false);
  }

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  const pastWeeks = history.filter((r) => r.id !== weekId());

  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow={`Week of ${formatShortDate(weekStartKey())}`}
        title="Weekly reflection"
        description="Once a week, step back. This is where scattered days become a story you can learn from."
      />

      <Card className="mb-6">
        <div className="space-y-5">
          {PROMPTS.map((p) => (
            <div key={p.key}>
              <FieldLabel>{p.label}</FieldLabel>
              <Textarea
                value={fields[p.key]}
                onChange={(e) => setFields((prev) => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={p.placeholder}
              />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving your reflection…" : "Save this week"}
          </Button>
        </div>

        {summary ? (
          <div className="mt-6 rounded-xl border border-accent/15 bg-accent-soft/60 p-5">
            <p className="label mb-2 text-accent-ink/70">Your week, reflected back</p>
            <p className="prose-reflection text-[15px]">{summary}</p>
          </div>
        ) : null}
      </Card>

      {pastWeeks.length > 0 ? (
        <section>
          <h2 className="mb-4 font-serif text-lg text-ink">Your growth timeline</h2>
          <div className="space-y-4">
            {pastWeeks.map((r) => (
              <Card key={r.id}>
                <p className="text-xs text-faint">Week of {formatShortDate(r.weekStart)}</p>
                {r.summary ? (
                  <p className="mt-2 prose-reflection text-[15px]">{r.summary}</p>
                ) : (
                  <dl className="mt-3 space-y-2 text-sm">
                    {r.improved ? (
                      <div>
                        <dt className="text-faint">Improved</dt>
                        <dd className="text-ink/90">{r.improved}</dd>
                      </div>
                    ) : null}
                    {r.nextWeek ? (
                      <div>
                        <dt className="text-faint">Committed to</dt>
                        <dd className="text-ink/90">{r.nextWeek}</dd>
                      </div>
                    ) : null}
                  </dl>
                )}
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </Page>
  );
}
