"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listDailies, getDaily } from "@/services/dailyService";
import { listNafsIncidents } from "@/services/nafsService";
import { getLatestAssessment } from "@/services/assessmentService";
import { computeIndices } from "@/services/scoreService";
import {
  buildTrend,
  summarizeWindow,
} from "@/domain/behavior/scoring";
import { detectPatterns } from "@/domain/patterns/detect";
import { rankedNafs, tallyNafs } from "@/domain/nafs/analytics";
import { NAFS_LABELS } from "@/domain/types";
import type {
  BehaviorIndices,
  DailyEntry,
  DetectedPattern,
  NafsIncident,
} from "@/domain/types";
import { daysAgoKey, todayKey } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreDial } from "@/components/ui/ScoreDial";
import { Sparkline } from "@/components/ui/Sparkline";
import { PatternCard } from "@/components/patterns/PatternCard";
import { InterventionBanner } from "@/components/interventions/InterventionBanner";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="mt-1 font-serif text-2xl text-ink">{value}</p>
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const [indices, setIndices] = useState<BehaviorIndices | null>(null);
  const [dailies, setDailies] = useState<DailyEntry[]>([]);
  const [incidents, setIncidents] = useState<NafsIncident[]>([]);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [todayDone, setTodayDone] = useState<{ committed: boolean; reviewed: boolean }>({
    committed: false,
    reviewed: false,
  });
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const today = todayKey();
      const [history, inc, assessment, todayEntry] = await Promise.all([
        listDailies(user.uid, daysAgoKey(120)),
        listNafsIncidents(user.uid, daysAgoKey(120)),
        getLatestAssessment(user.uid),
        getDaily(user.uid, today),
      ]);
      setDailies(history);
      setIncidents(inc);
      setIndices(computeIndices(history, inc, today));
      setPatterns(detectPatterns(history, inc).slice(0, 2));
      setHasAssessment(Boolean(assessment));
      setTodayDone({
        committed: Boolean(todayEntry?.committedAt),
        reviewed: Boolean(todayEntry?.reviewedAt),
      });
      setLoading(false);
    })();
  }, [user]);

  if (loading || !indices) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  if (hasAssessment === false) {
    return (
      <Page>
        <Card className="text-center">
          <h2 className="font-serif text-xl text-ink">Start with the assessment</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            It reveals your starting line — the archetype you&apos;ll evolve beyond.
          </p>
          <Link href="/assessment" className="mt-6 inline-block">
            <Button size="lg">Begin the assessment</Button>
          </Link>
        </Card>
      </Page>
    );
  }

  const monthly = summarizeWindow(dailies.filter((d) => d.date >= daysAgoKey(30)));
  const trend = buildTrend(dailies.filter((d) => d.date >= daysAgoKey(21)));
  const topNafs = rankedNafs(tallyNafs(incidents, daysAgoKey(30))).filter((n) => n.count > 0).slice(0, 3);
  const firstName = (profile?.displayName ?? "trader").split(" ")[0];
  const inRoom = (profile?.roomIds.length ?? 0) > 0;

  return (
    <Page>
      <PageHeader
        eyebrow="Dashboard"
        title={`Are you becoming more disciplined, ${firstName}?`}
        description="The only metric that matters is whether your violations fall over time."
        action={
          <Link href="/daily">
            <Button>{!todayDone.committed ? "Commit to today" : !todayDone.reviewed ? "Review today" : "Today's check-in"}</Button>
          </Link>
        }
      />

      <InterventionBanner />

      {/* Today's call to action */}
      {!todayDone.committed || !todayDone.reviewed ? (
        <Card className="mb-6 border-accent/20 bg-accent-soft/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink">
              {!todayDone.committed
                ? "You haven't committed to today yet. Intention before action."
                : "Commitments locked. Review your day after the session closes."}
            </p>
            <Link href="/daily">
              <Button size="sm">{!todayDone.committed ? "Set commitments" : "Review now"}</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center text-center">
          <ScoreDial value={indices.disciplineScore} label="Discipline" />
          <p className="mt-4 max-w-[220px] text-sm text-muted">
            Your discipline score, built from behavior alone.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label="Consistency" value={`${indices.consistencyScore}`} hint="showed up (30d)" />
            <Stat label="Completion" value={`${Math.round(indices.completionRate * 100)}%`} hint="commitments honored" />
            <Stat label="Nafs control" value={`${indices.nafsControlIndex}`} hint="internal battles" />
            <Stat label="Streak" value={`${indices.currentStreak}`} hint="clean days" />
          </div>
          <div className="mt-7">
            <p className="label mb-3">Behavior trend · 21 days</p>
            <Sparkline data={trend.map((t) => ({ date: t.date, score: t.dayScore }))} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">What we&apos;re noticing</h2>
            <Link href="/patterns" className="text-sm text-accent hover:underline">All patterns</Link>
          </div>
          {patterns.length > 0 ? (
            patterns.map((p) => <PatternCard key={p.id} pattern={p} />)
          ) : (
            <Card>
              <p className="text-sm text-muted">
                Keep logging your days. Once there&apos;s enough history, Niyyah OS will
                surface the patterns behind your violations.
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="label">Nafs battles (30d)</h3>
              <Link href="/nafs" className="text-sm text-accent hover:underline">Tracker</Link>
            </div>
            {topNafs.length > 0 ? (
              <ul className="space-y-2">
                {topNafs.map((n) => (
                  <li key={n.category} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{NAFS_LABELS[n.category]}</span>
                    <span className="tabular-nums text-muted">{n.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No violations logged yet.</p>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="label">Accountability room</h3>
              <Link href="/rooms" className="text-sm text-accent hover:underline">Open</Link>
            </div>
            <p className="text-sm text-muted">
              {inRoom
                ? "Your room can see whether you followed through today."
                : "You're not in a room yet. Visibility is what changes behavior."}
            </p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
