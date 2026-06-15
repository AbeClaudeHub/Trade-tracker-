"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getLatestAssessment, saveInterpretation } from "@/services/assessmentService";
import { getArchetype } from "@/domain/archetypes/engine";
import { rankDimensions } from "@/domain/assessment/scoring";
import { DIMENSION_LABELS, type AssessmentResult } from "@/domain/types";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DimensionBar } from "@/components/ui/ScoreDial";

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="label mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/90">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArchetypeReport() {
  const { user } = useAuth();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [interpretation, setInterpretation] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const latest = await getLatestAssessment(user.uid);
      if (cancelled) return;
      setResult(latest);
      setLoading(false);

      if (latest) {
        if (latest.interpretation) {
          setInterpretation(latest.interpretation);
        } else {
          try {
            const res = await fetch("/api/ai/interpret", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                archetypeId: latest.archetypeId,
                scores: latest.dimensionScores,
              }),
            });
            const data = await res.json();
            if (!cancelled && data.interpretation) {
              setInterpretation(data.interpretation);
              saveInterpretation(user.uid, latest.id, data.interpretation).catch(
                () => {},
              );
            }
          } catch {
            /* fall back silently to the static report */
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  if (!result) {
    return (
      <Page>
        <Card className="text-center">
          <h2 className="font-serif text-xl text-ink">No assessment yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Your archetype is revealed by the behavioral assessment. It takes
            about eight minutes and is the foundation of everything here.
          </p>
          <Link href="/assessment" className="mt-6 inline-block">
            <Button size="lg">Take the assessment</Button>
          </Link>
        </Card>
      </Page>
    );
  }

  const archetype = getArchetype(result.archetypeId);
  const secondary = result.secondaryArchetypeId
    ? getArchetype(result.secondaryArchetypeId)
    : null;
  const ranked = rankDimensions(result.dimensionScores);

  return (
    <Page>
      <PageHeader
        eyebrow="Your trader archetype"
        title={archetype.name}
        description={archetype.tagline}
        action={
          <Link href="/assessment">
            <Button variant="secondary" size="sm">
              Retake
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <p className="prose-reflection text-[15px] md:text-base">
              {archetype.description}
            </p>
            {interpretation ? (
              <div className="mt-5 rounded-xl border border-accent/15 bg-accent-soft/60 p-5">
                <p className="label mb-2 text-accent-ink/70">A note for you</p>
                <p className="prose-reflection whitespace-pre-line text-[15px]">
                  {interpretation}
                </p>
              </div>
            ) : null}
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <Section title="Strengths" items={archetype.strengths} />
            </Card>
            <Card>
              <Section title="Blind spots" items={archetype.blindSpots} />
            </Card>
            <Card>
              <Section title="Common mistakes" items={archetype.commonMistakes} />
            </Card>
            <Card>
              <Section title="Emotional triggers" items={archetype.emotionalTriggers} />
            </Card>
          </div>

          <Card className="border-accent/20 bg-accent-soft/40">
            <Section title="Where to begin" items={archetype.recommendations} />
            <Link href="/daily" className="mt-6 inline-block">
              <Button>Start your daily practice</Button>
            </Link>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="label mb-4">Your behavioral profile</h3>
            <div className="space-y-3.5">
              {ranked.map((d) => (
                <DimensionBar
                  key={d.dimension}
                  label={DIMENSION_LABELS[d.dimension]}
                  value={d.score}
                />
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-faint">
              Higher means healthier behavior. Your lowest dimensions are where
              your archetype lives — and where the work begins.
            </p>
          </Card>

          {secondary ? (
            <Card>
              <h3 className="label mb-2">A secondary pull</h3>
              <p className="font-serif text-lg text-ink">{secondary.name}</p>
              <p className="mt-1 text-sm text-muted">{secondary.tagline}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </Page>
  );
}
