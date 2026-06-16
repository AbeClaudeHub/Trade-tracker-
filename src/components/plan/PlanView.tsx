"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getReport } from "@/services/reportService";
import { getPlanProgress, toggleDay } from "@/services/planService";
import { generateDayPlan } from "@/domain/plan/generate";
import { getArchetype } from "@/domain/archetypes/engine";
import type { DayMission, PlanProgress, Report } from "@/domain/types";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { RingMotif } from "@/components/ui/RingMotif";
import { CopyButton } from "@/components/report/CopyButton";
import { cn } from "@/lib/utils";

function CheckCircle({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
        done ? "border-affirm bg-affirm text-white" : "border-line-strong text-transparent",
      )}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 6" />
      </svg>
    </span>
  );
}

export function PlanView() {
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [r, p] = await Promise.all([getReport(user.uid), getPlanProgress(user.uid)]);
      setReport(r);
      setProgress(p);
      setLoading(false);
    })();
  }, [user]);

  const missions = useMemo(
    () => (report ? generateDayPlan(getArchetype(report.archetypeId)) : []),
    [report],
  );

  const completed = useMemo(() => new Set(progress?.completed ?? []), [progress]);

  const todayNumber = useMemo(() => {
    if (!progress) return 1;
    const start = new Date(progress.startDate + "T00:00:00");
    const diff = Math.floor((Date.now() - start.getTime()) / 86400000);
    return Math.min(30, Math.max(1, diff + 1));
  }, [progress]);

  async function onToggle(day: number) {
    if (!user) return;
    setPending(day);
    // optimistic
    setProgress((prev) => {
      if (!prev) return prev;
      const set = new Set(prev.completed);
      set.has(day) ? set.delete(day) : set.add(day);
      return { ...prev, completed: [...set].sort((a, b) => a - b) };
    });
    const next = await toggleDay(user.uid, day);
    setProgress(next);
    setPending(null);
  }

  if (loading) {
    return (
      <Page>
        <BrandLoader />
      </Page>
    );
  }

  if (!report) {
    return (
      <Page className="max-w-xl">
        <Card className="text-center">
          <h2 className="font-serif text-2xl text-ink">Your plan unlocks with your report</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Take the assessment to generate your diagnosis — your personal 30-day plan is built from it.
          </p>
          <Link href="/assessment" className="mt-7 inline-block"><Button size="lg">Take the assessment</Button></Link>
        </Card>
      </Page>
    );
  }

  const archetype = getArchetype(report.archetypeId);
  const count = completed.size;
  const pct = Math.round((count / 30) * 100);
  const today = missions[todayNumber - 1];
  const weeks = [1, 2, 3, 4].map((w) => ({ w, missions: missions.filter((m) => m.week === w) }));
  const weekTheme = (w: number) => missions.find((m) => m.week === w)?.theme ?? "";

  return (
    <Page>
      <PageHeader
        eyebrow="Your 30-day plan"
        title="From insight to identity, one day at a time"
        description={`A concrete daily path out of ${archetype.name.replace("The ", "the ").toLowerCase()} pattern. Do one mission a day, report it in your room, and watch the behavior change.`}
        action={<Link href="/report" className="print:hidden"><Button variant="ghost" size="sm">Back to report</Button></Link>}
      />

      {/* Progress + today */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card variant="accent" className="grain relative flex flex-col justify-center overflow-hidden lg:col-span-1">
          <RingMotif withOrbit={false} className="absolute -right-12 -bottom-12 h-44 w-44 opacity-60" />
          <p className="label relative">Progress</p>
          <p className="relative mt-2 font-serif text-5xl text-ink">{pct}%</p>
          <p className="relative mt-1 text-sm text-muted">{count} of 30 days complete</p>
          <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-sand">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <Pill tone="gold">Today · Day {todayNumber}</Pill>
            <span className="label">{today?.theme}</span>
          </div>
          <h2 className="font-serif text-2xl text-ink">{today?.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{today?.action}</p>
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-raised p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted"><span className="font-medium text-ink/80">Report in your room:</span> {today?.discordPrompt}</p>
            {today ? <span className="shrink-0"><CopyButton text={today.discordPrompt} label="Copy prompt" /></span> : null}
          </div>
          <div className="mt-5">
            <Button
              variant={completed.has(todayNumber) ? "secondary" : "primary"}
              onClick={() => onToggle(todayNumber)}
              disabled={pending === todayNumber}
            >
              {completed.has(todayNumber) ? "Completed ✓ — undo" : "Mark today complete"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Weeks */}
      <div className="mt-10 space-y-10">
        {weeks.map(({ w, missions: wm }) => {
          const doneInWeek = wm.filter((m) => completed.has(m.day)).length;
          return (
            <section key={w}>
              <div className="mb-4 flex items-center gap-3">
                <span className="section-index">{String(w).padStart(2, "0")}</span>
                <h3 className="font-serif text-xl text-ink">Week {w} · {weekTheme(w)}</h3>
                <span className="text-sm text-faint">{doneInWeek}/{wm.length}</span>
              </div>
              <div className="space-y-2.5">
                {wm.map((m: DayMission) => {
                  const done = completed.has(m.day);
                  const isToday = m.day === todayNumber;
                  return (
                    <button
                      key={m.day}
                      onClick={() => onToggle(m.day)}
                      disabled={pending === m.day}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                        done ? "border-affirm/30 bg-affirmsoft/50" : "border-line bg-surface hover:border-line-strong hover:bg-raised",
                        isToday && !done && "ring-1 ring-gold/40",
                      )}
                    >
                      <CheckCircle done={done} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-xs tabular-nums text-faint">Day {m.day}</span>
                          {isToday ? <span className="text-[11px] font-medium text-gold-ink">Today</span> : null}
                        </span>
                        <span className={cn("mt-0.5 block font-medium text-ink", done && "line-through decoration-affirm/50")}>{m.title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-muted">{m.action}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="py-10 text-center text-sm text-faint">
        One mission a day. Reported in your room. Thirty days from now, you won&apos;t recognise the old pattern.
      </p>
    </Page>
  );
}
