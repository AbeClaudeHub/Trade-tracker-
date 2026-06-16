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
import { RingMotif } from "@/components/ui/RingMotif";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

/* ── building blocks ───────────────────────────────────────────────────── */

function Section({
  index,
  kicker,
  title,
  sub,
  children,
}: {
  index: string;
  kicker: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 first:mt-0">
      <div className="mb-7 flex items-start gap-4">
        <span className="section-index pt-1.5">{index}</span>
        <div>
          <p className="label mb-1.5">{kicker}</p>
          <h2 className="font-serif text-2xl text-ink text-balance md:text-[1.75rem]">{title}</h2>
          {sub ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted text-pretty">{sub}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function Crest({ letter, size = 88 }: { letter: string; size?: number }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/15 to-gold/25" />
      <span className="absolute inset-[3px] rounded-full border border-gold-line/60 bg-surface" />
      <span className="relative font-serif text-gradient" style={{ fontSize: size * 0.42 }}>{letter}</span>
    </span>
  );
}

function List({ title, items, tone = "ink" }: { title: string; items: string[]; tone?: "ink" | "breach" | "affirm" }) {
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
            {!last ? <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-line-strong to-line" /> : null}
            <span className={cn("z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-sm", last ? "bg-breach/15 text-breach" : "bg-sand text-ink")}>
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
        <span className="print:hidden"><CopyButton text={text} /></span>
      </div>
      <pre className="whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-relaxed text-ink/90">{text}</pre>
    </div>
  );
}

/* ── report ────────────────────────────────────────────────────────────── */

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
        <BrandLoader />
      </Page>
    );
  }

  if (!report) {
    return (
      <Page className="max-w-xl">
        <Card className="text-center">
          <h2 className="font-serif text-2xl text-ink">No report yet</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Your diagnosis is built from the behavioral assessment — about eight minutes, and the foundation of everything here.
          </p>
          <Link href="/assessment" className="mt-7 inline-block"><Button size="lg">Take the assessment</Button></Link>
        </Card>
      </Page>
    );
  }

  const archetype = getArchetype(report.archetypeId);
  const secondary = report.secondaryArchetypeId ? getArchetype(report.secondaryArchetypeId) : null;
  const letter = archetype.name.replace("The ", "").charAt(0);

  /* Paywall */
  if (!unlocked) {
    return (
      <Page className="max-w-xl">
        <Card variant="gold" className="grain relative overflow-hidden text-center">
          <RingMotif className="absolute left-1/2 top-[-6rem] h-80 w-80 -translate-x-1/2 opacity-60" />
          <div className="relative">
            <div className="flex justify-center"><Crest letter={letter} /></div>
            <p className="label mt-5 text-gold-ink/70">Your report is ready</p>
            <h1 className="mt-2 font-serif text-3xl text-ink">You are {archetype.name}.</h1>
            <p className="mt-2 text-muted">{archetype.tagline}</p>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Your full diagnosis is complete — your blind spots, your self-sabotage loops, the nafs beneath your mistakes, and a personal 30-day blueprint to run inside your accountability room.
            </p>
            <div className="mx-auto mt-6 rounded-2xl border border-gold-line/40 bg-surface/70 p-5 text-left">
              <p className="label mb-1.5">A glimpse</p>
              <p className="text-[15px] italic text-ink/90">{archetype.blindSpots[0]}</p>
            </div>
            <Link href="/unlock" className="mt-7 inline-block"><Button variant="gold" size="lg">Unlock my full report</Button></Link>
            <p className="mt-4 text-xs text-faint">One-time access — no subscription.</p>
          </div>
        </Card>
      </Page>
    );
  }

  const dims = rankDimensions(report.dimensionScores);
  const nafs = rankNafs(report.nafsScores);
  const maxNafs = Math.max(1, ...nafs.map((n) => n.score));
  const dominant = nafs[0]!;

  return (
    <Page>
      {/* action bar */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="label flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-gold" /> Your behavioral diagnosis</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>Save as PDF</Button>
          <Link href="/assessment"><Button variant="ghost" size="sm">Retake</Button></Link>
        </div>
      </div>

      {/* COVER */}
      <Card className="grain relative overflow-hidden">
        <RingMotif className="absolute -right-20 -top-24 h-[28rem] w-[28rem] opacity-70" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Crest letter={letter} size={104} />
          <div>
            <p className="label mb-2">Trader archetype</p>
            <h1 className="font-serif text-display leading-[0.95] text-ink">{archetype.name}</h1>
            <p className="mt-3 text-lg text-muted text-pretty">{archetype.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone="breach">Dominant nafs · {NAFS_LABELS[report.dominantNafs]}</Pill>
              {secondary ? <Pill tone="neutral">Secondary · {secondary.name}</Pill> : null}
            </div>
          </div>
        </div>
        <div className="rule my-8" />
        <p className="relative max-w-3xl whitespace-pre-line text-[15px] leading-[1.8] text-ink/90 md:text-base">
          {report.ai?.interpretation ?? archetype.description}
        </p>
      </Card>

      {/* 01 — PROFILE */}
      <Section index="01" kicker="Behavioral profile" title="How you score across nine dimensions" sub="Higher means healthier behavior. Your lowest dimensions are where your archetype lives — and where the work begins.">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <div className="space-y-4">
              {dims.map((d) => (
                <DimensionBar key={d.dimension} label={DIMENSION_LABELS[d.dimension]} value={d.score} tone={d.score < 45 ? "breach" : "accent"} />
              ))}
            </div>
          </Card>
          <Card><List title="Strengths" items={archetype.strengths} tone="affirm" /></Card>
          <Card><List title="Blind spots" items={archetype.blindSpots} tone="breach" /></Card>
        </div>
      </Section>

      {/* 02 — NAFS */}
      <Section index="02" kicker="Nafs analysis" title="The root beneath the mistake" sub="Trades are symptoms; the nafs is the source. Win these inner battles and the mistakes dissolve.">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card variant="accent" className="grain relative flex flex-col justify-center overflow-hidden">
            <RingMotif withOrbit={false} className="absolute -right-10 -bottom-10 h-48 w-48 opacity-60" />
            <p className="label relative">Your dominant battle</p>
            <p className="relative mt-2 font-serif text-4xl text-ink">{NAFS_LABELS[dominant.category]}</p>
            <p className="relative mt-1 text-sm text-muted">Intensity {dominant.score} / 100</p>
            {report.ai?.nafsNarrative ? (
              <p className="relative mt-4 text-[15px] leading-relaxed text-ink/90">{report.ai.nafsNarrative}</p>
            ) : null}
          </Card>
          <Card>
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {nafs.map((n, i) => (
                <div key={n.category}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className={cn("text-sm", i === 0 ? "font-medium text-ink" : "text-ink")}>{NAFS_LABELS[n.category]}</span>
                    <span className="text-sm tabular-nums text-muted">{n.score}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sand">
                    <div className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", i === 0 ? "bg-gradient-to-r from-breach to-gold" : "bg-breach/55")} style={{ width: `${(n.score / maxNafs) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* 03 — LOOPS */}
      <Section index="03" kicker="Self-sabotage" title="The loops keeping you stuck" sub="The exact cycles that repeat. Name them, and you can break them.">
        <div className="grid gap-6 md:grid-cols-2">
          {report.loops.map((loop) => (
            <Card key={loop.title} variant="quiet">
              <h3 className="label mb-5">{loop.title}</h3>
              <LoopFlow steps={loop.steps} />
            </Card>
          ))}
        </div>
      </Section>

      {/* 04 — FULL PICTURE */}
      <Section index="04" kicker="The full picture" title="Triggers, violations & root causes">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card><List title="Emotional triggers" items={archetype.emotionalTriggers} /></Card>
          <Card><List title="Common rule violations" items={archetype.commonMistakes} tone="breach" /></Card>
          <Card><List title="Accountability weaknesses" items={archetype.accountabilityWeaknesses} tone="breach" /></Card>
          <Card><List title="Root causes" items={archetype.rootCauses} /></Card>
        </div>
      </Section>

      {/* 05 — DISCORD */}
      <Section index="05" kicker="Your accountability room" title="How to put this to work in Discord" sub="Niyyah OS explains your behavior. Your room holds you to it. Here is exactly how to use it.">
        <Card variant="accent">
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
      </Section>

      {/* 06 — BLUEPRINT */}
      <Section index="06" kicker="The plan" title="Your 30-Day Discipline Blueprint" sub={report.ai?.blueprintIntro}>
        <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-gold-line/50 bg-gold-soft/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label mb-1">Keystone commitment</p>
            <p className="font-serif text-lg text-ink">{report.blueprint.keystoneCommitment}</p>
          </div>
          <Pill tone="gold">30 days</Pill>
        </div>

        {/* timeline */}
        <ol className="relative space-y-5 pl-1">
          {report.blueprint.weeks.map((w, i) => {
            const last = i === report.blueprint.weeks.length - 1;
            return (
              <li key={w.week} className="relative flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-line/60 bg-surface font-serif text-lg text-gradient shadow-soft">
                    {w.week}
                  </span>
                  {!last ? <span className="mt-1 w-px flex-1 bg-gradient-to-b from-gold-line/70 to-line" /> : null}
                </div>
                <Card className="mb-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg text-ink">{w.theme}</h3>
                    <span className="label">Week {w.week}</span>
                  </div>
                  <p className="mt-2 text-[15px] font-medium leading-snug text-ink">{w.goal}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted"><span className="font-medium text-ink/80">Daily —</span> {w.dailyPractice}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted"><span className="font-medium text-ink/80">In your room —</span> {w.discordPrompt}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-gold-ink"><span className="h-1 w-1 rounded-full bg-gold" /> {w.milestone}</p>
                </Card>
              </li>
            );
          })}
        </ol>
      </Section>

      <div className="rule mx-auto my-12 max-w-xs" />
      <p className="pb-6 text-center font-serif text-lg text-muted text-balance">
        Niyyah OS explains your behavior.
        <br className="hidden sm:block" /> Your accountability room makes you live it.
      </p>
    </Page>
  );
}
