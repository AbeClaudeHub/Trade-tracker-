"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getReport, saveReportNarrative } from "@/services/reportService";
import { getArchetype } from "@/domain/archetypes/engine";
import { rankDimensions } from "@/domain/assessment/scoring";
import { rankNafs } from "@/domain/nafs/profile";
import {
  DIMENSION_LABELS,
  NAFS_LABELS,
  type Report,
} from "@/domain/types";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DimensionBar } from "@/components/ui/ScoreDial";
import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

function List({ title, items, tone = "ink" }: { title: string; items: string[]; tone?: "ink" | "breach" | "affirm" }) {
  const dot = tone === "breach" ? "bg-breach/60" : tone === "affirm" ? "bg-affirm/60" : "bg-accent/60";
  return (
    <div>
      <h3 className="label mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/90">
            <span className={cn("mt-2 h-1 w-1 shrink-0 rounded-full", dot)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Loop({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => (
        <li key={i} className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand font-serif text-sm text-ink">
              {i + 1}
            </span>
            <span className="text-[15px] text-ink">{step}</span>
          </div>
          {i < steps.length - 1 ? (
            <span className="ml-3.5 my-0.5 h-4 w-px bg-line-strong" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function ReportView() {
  const { user, profile } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const unlocked = Boolean(profile?.entitlement.unlocked);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const r = await getReport(user.uid);
      if (cancelled) return;
      setReport(r);
      setLoading(false);

      // Fetch AI narrative once if missing and unlocked.
      if (r && !r.ai && unlocked) {
        try {
          const res = await fetch("/api/ai/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ report: r }),
          });
          const data = await res.json();
          if (!cancelled && data.narrative) {
            setReport({ ...r, ai: data.narrative });
            saveReportNarrative(user.uid, data.narrative).catch(() => {});
          }
        } catch {
          /* deterministic content still renders */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, unlocked]);

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  if (!report) {
    return (
      <Page>
        <Card className="text-center">
          <h2 className="font-serif text-xl text-ink">No report yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Your diagnosis is built from the behavioral assessment — about eight
            minutes, and the foundation of everything here.
          </p>
          <Link href="/assessment" className="mt-6 inline-block">
            <Button size="lg">Take the assessment</Button>
          </Link>
        </Card>
      </Page>
    );
  }

  const archetype = getArchetype(report.archetypeId);

  // Paywall: assessment done, but report locked.
  if (!unlocked) {
    return (
      <Page className="max-w-2xl">
        <PageHeader eyebrow="Your report is ready" title={`You are ${archetype.name}.`} description={archetype.tagline} />
        <Card className="text-center">
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-muted">
            Your full behavioral diagnosis is complete — your blind spots, your
            self-sabotage loops, the nafs beneath your mistakes, and a personal
            30-day discipline blueprint to run inside your accountability room.
          </p>
          <div className="mt-6 rounded-xl border border-line bg-raised p-5 text-left">
            <p className="label mb-2">A glimpse</p>
            <p className="text-[15px] text-ink/90">
              One of your blind spots: <em>{archetype.blindSpots[0]}</em>
            </p>
          </div>
          <Link href="/unlock" className="mt-7 inline-block">
            <Button size="lg">Unlock my full report</Button>
          </Link>
          <p className="mt-4 text-xs text-faint">One-time access — no subscription.</p>
        </Card>
      </Page>
    );
  }

  const dims = rankDimensions(report.dimensionScores);
  const nafs = rankNafs(report.nafsScores);
  const maxNafs = Math.max(1, ...nafs.map((n) => n.score));

  return (
    <Page>
      <PageHeader
        eyebrow="Your behavioral diagnosis"
        title={archetype.name}
        description={archetype.tagline}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              Save as PDF
            </Button>
            <Link href="/assessment">
              <Button variant="ghost" size="sm">Retake</Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Interpretation */}
        <Card>
          <p className="prose-reflection whitespace-pre-line text-[15px] md:text-base">
            {report.ai?.interpretation ?? archetype.description}
          </p>
        </Card>

        {/* Behavioral profile + strengths/blind spots */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <h3 className="label mb-4">Behavioral profile</h3>
            <div className="space-y-3.5">
              {dims.map((d) => (
                <DimensionBar key={d.dimension} label={DIMENSION_LABELS[d.dimension]} value={d.score} />
              ))}
            </div>
            <p className="mt-4 text-xs text-faint">Higher = healthier behavior. Your lowest are where the work begins.</p>
          </Card>
          <Card><List title="Strengths" items={archetype.strengths} tone="affirm" /></Card>
          <Card><List title="Blind spots" items={archetype.blindSpots} tone="breach" /></Card>
        </div>

        {/* Nafs analysis */}
        <Card>
          <h2 className="font-serif text-lg text-ink">Nafs analysis — the root beneath the mistake</h2>
          <p className="mt-1 text-sm text-muted">Your dominant inner battle is <span className="font-medium text-ink">{NAFS_LABELS[report.dominantNafs]}</span>.</p>
          {report.ai?.nafsNarrative ? (
            <p className="mt-3 prose-reflection text-[15px]">{report.ai.nafsNarrative}</p>
          ) : null}
          <div className="mt-5 space-y-3">
            {nafs.map((n) => (
              <div key={n.category}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm text-ink">{NAFS_LABELS[n.category]}</span>
                  <span className="text-sm tabular-nums text-muted">{n.score}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-breach/70" style={{ width: `${(n.score / maxNafs) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Self-sabotage loops */}
        <Card>
          <h2 className="mb-1 font-serif text-lg text-ink">Your self-sabotage loops</h2>
          <p className="mb-5 text-sm text-muted">The exact cycles keeping you stuck.</p>
          <div className="grid gap-8 md:grid-cols-2">
            {report.loops.map((loop) => (
              <div key={loop.title}>
                <h3 className="label mb-4">{loop.title}</h3>
                <Loop steps={loop.steps} />
              </div>
            ))}
          </div>
        </Card>

        {/* Triggers / violations / accountability / root causes */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card><List title="Emotional triggers" items={archetype.emotionalTriggers} /></Card>
          <Card><List title="Common rule violations" items={archetype.commonMistakes} tone="breach" /></Card>
          <Card><List title="Accountability weaknesses" items={archetype.accountabilityWeaknesses} tone="breach" /></Card>
          <Card><List title="Root causes" items={archetype.rootCauses} /></Card>
        </div>

        {/* Discord plan */}
        <Card className="border-accent/20 bg-accent-soft/30">
          <h2 className="font-serif text-lg text-ink">How to use your accountability room</h2>
          <p className="mt-1 text-sm text-muted">Niyyah OS explains your behavior. Your Discord room holds you to it. Here&apos;s exactly how to use it.</p>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="label">Your daily check-in script</h3>
                <span className="print:hidden"><CopyButton text={report.discord.dailyReportScript} /></span>
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-line bg-surface p-4 text-sm text-ink/90">{report.discord.dailyReportScript}</pre>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="label">Your room briefing card</h3>
                <span className="print:hidden"><CopyButton text={report.discord.briefingCard} /></span>
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-line bg-surface p-4 text-sm text-ink/90">{report.discord.briefingCard}</pre>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <List title="Commit to" items={report.discord.commitments} tone="affirm" />
            <List title="Focus your weaknesses" items={report.discord.focusWeaknesses} />
            <List title="Monitor & report" items={report.discord.monitorBehaviors} tone="breach" />
          </div>
        </Card>

        {/* 30-day blueprint */}
        <Card>
          <h2 className="font-serif text-lg text-ink">Your 30-Day Discipline Blueprint</h2>
          {report.ai?.blueprintIntro ? (
            <p className="mt-2 prose-reflection text-[15px]">{report.ai.blueprintIntro}</p>
          ) : null}
          <div className="mt-3 rounded-xl border border-accent/15 bg-accent-soft/50 px-4 py-3">
            <p className="label mb-1">Keystone commitment</p>
            <p className="text-[15px] font-medium text-ink">{report.blueprint.keystoneCommitment}</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {report.blueprint.weeks.map((w) => (
              <div key={w.week} className="rounded-2xl border border-line bg-raised p-5">
                <p className="label">Week {w.week} · {w.theme}</p>
                <p className="mt-2 text-[15px] font-medium text-ink">{w.goal}</p>
                <p className="mt-2 text-sm text-muted"><span className="text-ink/80">Daily:</span> {w.dailyPractice}</p>
                <p className="mt-1.5 text-sm text-muted"><span className="text-ink/80">Report in room:</span> {w.discordPrompt}</p>
                <p className="mt-2 text-xs text-accent">Milestone: {w.milestone}</p>
              </div>
            ))}
          </div>
        </Card>

        <p className="pt-2 text-center text-xs text-faint">
          Niyyah OS explains your behavior. Your accountability room makes you live it.
        </p>
      </div>
    </Page>
  );
}
