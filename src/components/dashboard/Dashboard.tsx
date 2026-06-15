"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listDailies } from "@/services/dailyService";
import { listReflections } from "@/services/reflectionService";
import { getMyLink } from "@/services/partnerService";
import { getLatestAssessment } from "@/services/assessmentService";
import {
  buildTrend,
  consistencyStreak,
  disciplineIndex,
  summarizeWindow,
} from "@/domain/behavior/scoring";
import { detectPatterns } from "@/domain/patterns/detect";
import { getArchetype } from "@/domain/archetypes/engine";
import type {
  DailyEntry,
  DetectedPattern,
  PartnerLink,
  WeeklyReflection,
} from "@/domain/types";
import { daysAgoKey, todayKey, weekStartKey, formatShortDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreDial } from "@/components/ui/ScoreDial";
import { Sparkline } from "@/components/ui/Sparkline";
import { PatternCard } from "@/components/patterns/PatternCard";

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
  const [dailies, setDailies] = useState<DailyEntry[]>([]);
  const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [link, setLink] = useState<PartnerLink | null>(null);
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [history, refl, partnerLink, assessment] = await Promise.all([
        listDailies(user.uid, daysAgoKey(90)),
        listReflections(user.uid),
        getMyLink(user.uid),
        getLatestAssessment(user.uid),
      ]);
      setDailies(history);
      setReflections(refl);
      setPatterns(detectPatterns(history).slice(0, 2));
      setLink(partnerLink);
      setHasAssessment(Boolean(assessment));
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
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
            Everything in Niyyah OS begins with understanding how you behave.
            Take the behavioral assessment to reveal your archetype.
          </p>
          <Link href="/assessment" className="mt-6 inline-block">
            <Button size="lg">Begin the assessment</Button>
          </Link>
        </Card>
      </Page>
    );
  }

  const weekStart = weekStartKey();
  const weekly = summarizeWindow(dailies.filter((d) => d.date >= weekStart));
  const monthly = summarizeWindow(dailies.filter((d) => d.date >= daysAgoKey(30)));
  const streak = consistencyStreak(dailies, todayKey());
  const trend = buildTrend(dailies.filter((d) => d.date >= daysAgoKey(21)));
  const index = disciplineIndex(monthly.average);
  const archetype = profile?.archetypeId ? getArchetype(profile.archetypeId) : null;
  const latestReflection = reflections[0];

  const firstName = (profile?.displayName ?? "trader").split(" ")[0];

  return (
    <Page>
      <PageHeader
        eyebrow="Dashboard"
        title={`How disciplined are you becoming, ${firstName}?`}
        description={
          archetype
            ? `Tracked as ${archetype.name}. The only metric that matters is whether your violations fall over time.`
            : "The only metric that matters is whether your violations fall over time."
        }
        action={
          <Link href="/daily">
            <Button>Today&apos;s check-in</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Discipline index */}
        <Card className="flex flex-col items-center justify-center text-center">
          <ScoreDial value={index} label="Discipline" />
          <p className="mt-4 max-w-[220px] text-sm text-muted">
            Your 30-day discipline index, built from behavior alone.
          </p>
        </Card>

        {/* Key numbers */}
        <Card className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat
              label="This week"
              value={weekly.total > 0 ? `+${weekly.total}` : `${weekly.total}`}
              hint={`${weekly.days} day${weekly.days === 1 ? "" : "s"} logged`}
            />
            <Stat
              label="This month"
              value={monthly.total > 0 ? `+${monthly.total}` : `${monthly.total}`}
              hint={`${monthly.violations} violation${monthly.violations === 1 ? "" : "s"}`}
            />
            <Stat label="Streak" value={`${streak}`} hint="clean days in a row" />
            <Stat
              label="Affirmations"
              value={`${monthly.affirmations}`}
              hint="disciplined acts (30d)"
            />
          </div>
          <div className="mt-7">
            <p className="label mb-3">Behavior trend · 21 days</p>
            <Sparkline data={trend} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Patterns */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">What we&apos;re noticing</h2>
            <Link href="/patterns" className="text-sm text-accent hover:underline">
              All patterns
            </Link>
          </div>
          {patterns.length > 0 ? (
            patterns.map((p) => <PatternCard key={p.id} pattern={p} />)
          ) : (
            <Card>
              <p className="text-sm text-muted">
                Keep logging your days. Once there&apos;s enough history, Niyyah OS
                will surface the patterns behind your violations — the ones that
                are hard to see from the inside.
              </p>
            </Card>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="label">Latest reflection</h3>
              <Link href="/reflection" className="text-sm text-accent hover:underline">
                Reflect
              </Link>
            </div>
            {latestReflection ? (
              <div>
                <p className="text-xs text-faint">
                  Week of {formatShortDate(latestReflection.weekStart)}
                </p>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink/90">
                  {latestReflection.nextWeek || latestReflection.improved || "—"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted">
                You haven&apos;t reflected yet this week.
              </p>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="label">Accountability partner</h3>
              <Link href="/partner" className="text-sm text-accent hover:underline">
                Manage
              </Link>
            </div>
            {link?.status === "active" ? (
              <p className="text-sm text-ink/90">You have an active partner.</p>
            ) : link?.status === "pending" ? (
              <p className="text-sm text-muted">A partner request is pending.</p>
            ) : (
              <p className="text-sm text-muted">
                No partner yet. One person who sees your behavior changes
                everything.
              </p>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}
