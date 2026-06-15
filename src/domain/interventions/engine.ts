import type {
  DailyEntry,
  DetectedPattern,
  Intervention,
  InterventionTrigger,
  InterventionType,
} from "@/domain/types";
import { countViolations } from "@/domain/behavior/scoring";

export type InterventionDraft = Pick<
  Intervention,
  "type" | "trigger" | "title" | "message" | "escalationLevel"
>;

/** Escalation ladder: low → high friction. Supportive, never punitive. */
const LADDER: InterventionType[] = [
  "patternWarning",
  "extraReflection",
  "mandatoryReview",
  "commitmentReset",
  "focusChallenge",
  "partnerNotification",
];

function draft(
  type: InterventionType,
  trigger: InterventionTrigger,
  title: string,
  message: string,
): InterventionDraft {
  return { type, trigger, title, message, escalationLevel: LADDER.indexOf(type) + 1 };
}

/**
 * Evaluate a trader's recent state and propose interventions. The caller is
 * responsible for de-duplication, cooldowns, and persistence.
 *
 * `priorRepeats` lets the caller escalate: e.g. a commitment broken a 3rd time
 * warrants more friction than the 1st.
 */
export function evaluateInterventions(args: {
  entries: DailyEntry[];
  patterns: DetectedPattern[];
  todayIso: string;
  disappeared?: boolean;
  scoreDrop7d?: number; // positive number = points dropped
  brokenStreakAfter?: number; // length of streak just broken (0 if none)
}): InterventionDraft[] {
  const { entries, patterns, disappeared, scoreDrop7d = 0, brokenStreakAfter = 0 } = args;
  const drafts: InterventionDraft[] = [];

  // Time-based: disappearance
  if (disappeared) {
    drafts.push(
      draft(
        "partnerNotification",
        "disappearance",
        "We've missed you.",
        "You haven't checked in for a few days. This is exactly when accountability matters most. Your room would rather support you than watch you vanish.",
      ),
    );
  }

  // Score drop
  if (scoreDrop7d >= 10) {
    drafts.push(
      draft(
        "extraReflection",
        "scoreDrop",
        "Your discipline is slipping.",
        `Your Discipline Score fell ${Math.round(scoreDrop7d)} points this week. That's not failure — it's a signal. Let's add one honest reflection prompt to find the cause.`,
      ),
    );
  }

  // Streak break after a long clean run
  if (brokenStreakAfter >= 14) {
    drafts.push(
      draft(
        "patternWarning",
        "streakBreakAfterLong",
        `A ${brokenStreakAfter}-day streak ended.`,
        "One violation does not erase the discipline you built. Notice what changed today, then begin the next streak. Progress is not a straight line.",
      ),
    );
  }

  // Same violation repeated recently
  {
    const recent = entries
      .filter((e) => e.reviewedAt)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
    const tally = new Map<string, number>();
    for (const e of recent)
      for (const a of e.actions) tally.set(a, (tally.get(a) ?? 0) + 1);
    for (const [, count] of tally) {
      if (count >= 3) {
        drafts.push(
          draft(
            "mandatoryReview",
            "sameViolationRepeat",
            "The same mistake, three times this week.",
            "Tomorrow's commitments are locked until you complete a short behavioral review. Awareness before action.",
          ),
        );
        break;
      }
    }
    void countViolations; // (kept available for callers extending this logic)
  }

  // Pattern-driven (commitment relapse / nafs spike)
  for (const p of patterns) {
    if (p.trigger === "commitmentRelapse") {
      drafts.push(
        draft(
          "commitmentReset",
          "commitmentRelapse",
          "Time to get back to basics.",
          `${p.title} We'll simplify your commitments so you can win one small promise at a time.`,
        ),
      );
    }
    if (p.trigger === "nafsSpike") {
      drafts.push(
        draft(
          "focusChallenge",
          "nafsSpike",
          "A recurring internal battle.",
          `${p.detail} Consider a short focus challenge aimed squarely at this.`,
        ),
      );
    }
  }

  // De-dupe by trigger, keep the highest-friction draft per trigger.
  const byTrigger = new Map<InterventionTrigger, InterventionDraft>();
  for (const d of drafts) {
    const existing = byTrigger.get(d.trigger);
    if (!existing || d.escalationLevel > existing.escalationLevel) {
      byTrigger.set(d.trigger, d);
    }
  }
  return [...byTrigger.values()];
}
