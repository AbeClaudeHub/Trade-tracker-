"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listDailies } from "@/services/dailyService";
import { listNafsIncidents } from "@/services/nafsService";
import { detectPatterns } from "@/domain/patterns/detect";
import type { DailyEntry, DetectedPattern } from "@/domain/types";
import { daysAgoKey } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { PatternCard } from "./PatternCard";

export function PatternsView() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [narrative, setNarrative] = useState("");
  const [days, setDays] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [history, incidents] = await Promise.all([
        listDailies(user.uid, daysAgoKey(180)),
        listNafsIncidents(user.uid, daysAgoKey(180)),
      ]);
      if (cancelled) return;
      const detected = detectPatterns(history, incidents);
      setDays(history);
      setPatterns(detected);
      setLoading(false);

      if (detected.length > 0) {
        try {
          const res = await fetch("/api/ai/patterns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patterns: detected }),
          });
          const data = await res.json();
          if (!cancelled && data.narrative) setNarrative(data.narrative);
        } catch {
          /* deterministic cards still stand on their own */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loggedDays = days.filter((d) => d.postMarket || d.actions.length > 0).length;

  return (
    <Page>
      <PageHeader
        eyebrow="Pattern detection"
        title="The patterns beneath your behavior"
        description="Niyyah OS watches your history for the loops you can't see from the inside. Insights only appear when the evidence is strong enough to trust."
      />

      {loading ? (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      ) : patterns.length === 0 ? (
        <Card>
          <h2 className="font-serif text-lg text-ink">Not enough signal yet</h2>
          <p className="mt-2 max-w-lg text-muted">
            You&apos;ve logged {loggedDays} day{loggedDays === 1 ? "" : "s"}.
            Patterns surface once there&apos;s enough history to separate a habit
            from a coincidence — usually within a couple of weeks of consistent
            check-ins. Keep showing up.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {narrative ? (
            <Card className="border-accent/20 bg-accent-soft/40">
              <p className="label mb-2 text-accent-ink/70">The bigger picture</p>
              <p className="prose-reflection text-[15px] md:text-base">{narrative}</p>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {patterns.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
