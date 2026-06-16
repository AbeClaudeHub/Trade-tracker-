"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getReport, saveReportNarrative } from "@/services/reportService";
import { getArchetype } from "@/domain/archetypes/engine";
import { rankDimensions } from "@/domain/assessment/scoring";
import { rankNafs } from "@/domain/nafs/profile";
import { DIMENSION_LABELS, NAFS_LABELS, type Report } from "@/domain/types";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { DimensionBar } from "@/components/ui/ScoreDial";
import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

/* ── small building blocks ─────────────────────────────────────────────── */

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <p className="label mb-2 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-gold" />
        {kicker}
      </p>
      <h2 className="font-serif text-2xl text-ink text-balance">{title}</h2>
      {sub ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{sub}</p> : null}
    </div>
  );
}

function Crest({ letter }: { letter: string }) {
  return (
    <span className="relative inline-flex h-20 w-20 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/15 to-gold/20" />
      <span className="absolute inset-[3px] rounded-full border border-gold-line/60 bg-surface" />
      <span className="relative font-serif text-3xl text-gradient">{letter}</span>
    </span>
  );
}

function List({
  title,
  items,
  tone = "ink",
}: {
  title: string;
  items: string[];
  tone?: "ink" | "breach" | "affirm";
}) {
  const dot = tone === "breach" ? "bg-breach/70" : tone === "affirm" ? "bg-affirm/70" : "bg-gold/70";
  return (
    <div>
      <h3 className="label mb-3.5">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/90">
            <span className={cn("mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoopFlow({ steps }: { steps: string[] }) {
  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
            {!last ? (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-line-strong to-line" />
            ) : null}
            <span
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-sm",
                last ? "bg-breach/15 text-breach" : "bg-sand text-ink",
              )}
            >
              {i + 1}
            </span>
            <span className="pt-1 text-[15px] leading-snug text-ink">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ScriptBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-raised">
      <div className="flex items-center justify-between border-b border-line bg-surface/60 px-4 py-2.5">
        <span className="label">{title}</span>
        <span className="print:hidden">
          <CopyButton text={text} />
        </span>
      </div>
      <pre className="whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-relaxed text-ink/90">
        {text}
      </pre>
    </div>
  );
}

/* ── the report ────────────────────────────────────────────────────────── */

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
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      </Page>
    );
  }

  if (!report) {
    return (
      <Page className="max-w-xl">
        <Card className="text-center" inset>
          <h2 className="font-serif text-2xl text-ink">No report yet</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Your diagnosis is built from the behavioral assessment — about eight
            minutes, and the foundation of everything here.
          </p>
          <Link href="/assessment" className="mt-7 inline-block">
            <Button size="lg">Take the assessment</Button>
          </Link>
        </Card>
      </Page>
    );
  }

  const archetype = getArchetype(report.archetypeId);
  const secondary = report.secondaryArchetypeId ? getArchetype(report.secondaryArchetypeId) : null;

  /* Paywall */
  if (!unlocked) {
    return (
      <Page className="max-w-xl">
        <Card variant="gold" className="grain overflow-hidden text-center" inset>
          <div className="flex justify-center">
            <Crest letter={archetype.name.replace("The ", "").charAt(0)} />
          </div>
          <p className="label mt-5 text-gold-ink/70">Your report is ready</p>
          <h1 className="mt-2 font-serif text-3xl text-ink">You are {archetype.name}.</h1>
          <p className="mt-2 text-muted">{archetype.tagline}</p>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Your full diagnosis is complete — your blind spots, your self-sabotage
            loops, the nafs beneath your mistakes, and a personal 30-day blueprint
            to run inside your accountability room.
          </p>
          <div className="mx-auto mt-6 rounded-2xl border border-gold-line/40 bg-surface/70 p-5 text-left">
            <p className="label mb-1.5">A glimpse</p>
            <p className="text-[15px] italic text-ink/90">{archetype.blindSpots[0]}</p>
          </div>
          <Link href="/unlock" className="mt-7 inline-block">
            <Button variant="gold" size="lg">Unlock my full report</Button>
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
      {/* action bar */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="label flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-gold" /> Your behavioral diagnosis
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Save as PDF
          </Button>
          <Link href="/assessment">
            <Button variant="ghost" size="sm">Retake</Button>
          </Link>
        </div>
      </div>

      {/* HERO */}
      <Card className="grain relative overflow-hidden" inset>
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-accent/10 to-gold/10 blur-2xl" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Crest letter={archetype.name.replace("The ", "").charAt(0)} />
          <div>
            <p className="label mb-1.5">Trader archetype</p>
            <h1 className="font-serif text-display leading-none text-ink">{archetype.name}</h1>
            <p className="mt-2 text-lg text-muted">{archetype.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone="breach">Dominant nafs · {NAFS_LABELS[report.dominantNafs]}</Pill>
              {secondary ? <Pill tone="neutral">Secondary · {secondary.name}</Pill> : null}
            </div>
          </div>
        </div>
        <div className="rule my-7" />
        <p className="prose-reflection max-w-3xl whitespace-pre-line text-[15px] md:text-base">
          {report.ai?.interpretation ?? archetype.description}
        </p>
      </Card>

      {/* PROFILE + STRENGTHS/BLINDSPOTS */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="label mb-5">Behavioral profile</h3>
          <div className="space-y-4">
            {dims.map((d) => (
              <DimensionBar
                key={d.dimension}
                label={DIMENSION_LABELS[d.dimension]}
                value={d.score}
                tone={d.score < 45 ? "breach" : "accent"}
              />
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-faint">
            Higher means healthier behavior. Your lowest dimensions are where the work begins.
          </p>
        </Card>
        <Card><List title="Strengths" items={archetype.strengths} tone="affirm" /></Card>
        <Card><List title="Blind spots" items={archetype.blindSpots} tone="breach" /></Card>
      </div>

      {/* NAFS */}
      <Card className="mt-6">
        <SectionHeading
          kicker="Nafs analysis"
          title="The root beneath the mistake"
          sub={`Your dominant inner battle is ${NAFS_LABELS[report.dominantNafs].toLowerCase()}. Trades are symptoms; the nafs is the source.`}
        />
        {report.ai?.nafsNarrative ? (
          <p className="mb-6 prose-reflection max-w-3xl text-[15px]">{report.ai.nafsNarrative}</p>
        ) : null}
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {nafs.map((n, i) => (
            <div key={n.category}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className={cn("text-sm", i === 0 ? "font-medium text-ink" : "text-ink")}>
                  {NAFS_LABELS[n.category]}
                </span>
                <span className="text-sm tabular-nums text-muted">{n.score}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sand">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-1000 ease-out",
                    i === 0 ? "bg-gradient-to-r from-breach to-gold" : "bg-breach/55",
                  )}
                  style={{ width: `${(n.score / maxNafs) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* LOOPS */}
      <Card className="mt-6">
        <SectionHeading kicker="Self-sabotage" title="The loops keeping you stuck" sub="The exact cycles that repeat — name them, and you can break them." />
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {report.loops.map((loop) => (
            <div key={loop.title} className="rounded-2xl border border-line bg-raised p-6">
              <h3 className="label mb-5">{loop.title}</h3>
              <LoopFlow steps={loop.steps} />
            </div>
          ))}
        </div>
      </Card>

      {/* DETAIL GRID */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card><List title="Emotional triggers" items={archetype.emotionalTriggers} /></Card>
        <Card><List title="Common rule violations" items={archetype.commonMistakes} tone="breach" /></Card>
        <Card><List title="Accountability weaknesses" items={archetype.accountabilityWeaknesses} tone="breach" /></Card>
        <Card><List title="Root causes" items={archetype.rootCauses} /></Card>
      </div>

      {/* DISCORD */}
      <Card variant="accent" className="mt-6">
        <SectionHeading
          kicker="Your accountability room"
          title="How to put this to work in Discord"
          sub="Niyyah OS explains your behavior. Your room holds you to it. Here is exactly how to use it."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <ScriptBlock title="Daily check-in script" text={report.discord.dailyReportScript} />
          <ScriptBlock title="Room briefing card" text={report.discord.briefingCard} />
        </div>
        <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          <List title="Commit to" items={report.discord.commitments} tone="affirm" />
          <List title="Focus your weaknesses" items={report.discord.focusWeaknesses} />
          <List title="Monitor & report" items={report.discord.monitorBehaviors} tone="breach" />
        </div>
      </Card>

      {/* BLUEPRINT */}
      <Card className="mt-6 grain overflow-hidden">
        <SectionHeading kicker="The plan" title="Your 30-Day Discipline Blueprint" />
        {report.ai?.blueprintIntro ? (
          <p className="mb-5 prose-reflection max-w-3xl text-[15px]">{report.ai.blueprintIntro}</p>
        ) : null}
        <div className="mb-7 rounded-2xl border border-gold-line/50 bg-gold-soft/40 px-5 py-4">
          <p className="label mb-1">Keystone commitment</p>
          <p className="font-serif text-lg text-ink">{report.blueprint.keystoneCommitment}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {report.blueprint.weeks.map((w) => (
            <div key={w.week} className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
              <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-gold" />
              <div className="flex items-center justify-between">
                <Pill tone="accent">Week {w.week}</Pill>
                <span className="font-serif text-sm text-gold-ink">{w.theme}</span>
              </div>
              <p className="mt-3 text-[15px] font-medium leading-snug text-ink">{w.goal}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                <span className="font-medium text-ink/80">Daily —</span> {w.dailyPractice}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                <span className="font-medium text-ink/80">In your room —</span> {w.discordPrompt}
              </p>
              <p className="mt-3 flex items-center gap-2 text-xs text-gold-ink">
                <span className="h-1 w-1 rounded-full bg-gold" /> {w.milestone}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <p className="py-10 text-center text-sm text-faint">
        Niyyah OS explains your behavior. Your accountability room makes you live it.
      </p>
    </Page>
  );
}
