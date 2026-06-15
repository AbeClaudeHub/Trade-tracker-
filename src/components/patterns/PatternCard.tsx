import type { DetectedPattern, PatternSeverity } from "@/domain/types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const TONE: Record<PatternSeverity, { dot: string; label: string; text: string }> = {
  insight: { dot: "bg-accent", label: "Insight", text: "text-accent" },
  watch: { dot: "bg-caution", label: "Watch", text: "text-caution" },
  alert: { dot: "bg-breach", label: "Alert", text: "text-breach" },
};

export function PatternCard({ pattern }: { pattern: DetectedPattern }) {
  const tone = TONE[pattern.severity];
  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className={cn("flex items-center gap-2 text-xs font-medium", tone.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
          {tone.label}
        </span>
        <span className="text-xs text-faint">
          {Math.round(pattern.confidence * 100)}% confidence
        </span>
      </div>
      <h3 className="font-serif text-lg text-ink">{pattern.title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{pattern.detail}</p>
    </Card>
  );
}
