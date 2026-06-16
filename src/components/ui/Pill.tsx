import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "gold" | "affirm" | "breach";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-raised text-muted",
  accent: "border-accent/20 bg-accent-soft text-accent-ink",
  gold: "border-gold-line/60 bg-gold-soft text-gold-ink",
  affirm: "border-affirm/25 bg-affirmsoft text-affirm",
  breach: "border-breach/25 bg-breachsoft text-breach",
};

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
