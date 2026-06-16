"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  ASSESSMENT_QUESTIONS,
  LIKERT_LABELS,
} from "@/domain/assessment/questions";
import { DIMENSION_LABELS, type LikertValue } from "@/domain/types";
import { generateAndSaveReport } from "@/services/reportService";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const LIKERT: LikertValue[] = [1, 2, 3, 4, 5];

export function AssessmentFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LikertValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = ASSESSMENT_QUESTIONS.length;
  const question = ASSESSMENT_QUESTIONS[index]!;
  const current = answers[question.id];
  const progress = useMemo(
    () => Math.round((Object.keys(answers).length / total) * 100),
    [answers, total],
  );

  function choose(value: LikertValue) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    // Gentle auto-advance keeps friction low without feeling rushed.
    if (index < total - 1) {
      setTimeout(() => setIndex((i) => Math.min(total - 1, i + 1)), 180);
    }
  }

  async function finish() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await generateAndSaveReport(user.uid, answers);
      router.push("/report?fresh=1");
    } catch (e) {
      setError((e as Error).message ?? "Could not generate your report.");
      setSubmitting(false);
    }
  }

  const isLast = index === total - 1;
  const allAnswered = Object.keys(answers).length === total;

  return (
    <main className="mx-auto flex min-h-screen max-w-reading flex-col px-5 py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <span className="rounded-full border border-line bg-raised px-3 py-1 text-xs font-medium tabular-nums text-muted">
          {index + 1} <span className="text-faint">/ {total}</span>
        </span>
      </div>

      <div className="mb-12 h-1.5 w-full overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div key={question.id} className="flex flex-1 flex-col animate-fade-up">
        <p className="label mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-gold" />
          {DIMENSION_LABELS[question.dimension]}
        </p>
        <h1 className="font-serif text-2xl leading-snug text-ink text-balance md:text-[2rem]">
          {question.prompt}
        </h1>

        <div className="mt-10 space-y-2.5">
          {LIKERT.map((value) => (
            <button
              key={value}
              onClick={() => choose(value)}
              className={cn(
                "group flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200",
                current === value
                  ? "border-accent bg-accent-soft text-accent-ink shadow-soft"
                  : "border-line bg-surface text-ink hover:border-line-strong hover:bg-raised hover:shadow-soft",
              )}
            >
              <span className="text-[15px]">{LIKERT_LABELS[value]}</span>
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                  current === value
                    ? "border-accent bg-accent"
                    : "border-line-strong group-hover:border-ink/30",
                )}
              >
                {current === value ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">
          {error}
        </p>
      ) : null}

      <div className="mt-12 flex items-center justify-between">
        <Button
          variant="quiet"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Back
        </Button>

        {isLast ? (
          <Button onClick={finish} disabled={!allAnswered || submitting}>
            {submitting ? "Generating your report…" : "Reveal my report"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={current === undefined}
          >
            Next
          </Button>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-faint">
        Answer honestly. No one sees this but you — and honesty is the whole point.
      </p>
    </main>
  );
}
