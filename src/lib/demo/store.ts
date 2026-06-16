/**
 * Seeded in-memory store for demo mode — a fully-unlocked sample report so the
 * product can be explored (and sold) with no sign-up and no Firebase.
 */
import type { PlanProgress, Report, UserProfile } from "@/domain/types";
import { generateReport } from "@/domain/report/generate";
import type { AssessmentResponses, LikertValue } from "@/domain/types";
import { ASSESSMENT_QUESTIONS } from "@/domain/assessment/questions";
import { daysAgoKey } from "@/lib/dates";

const DEMO_UID = "demo-sam";

// Craft responses that resolve to a vivid "Chaser" profile (weak patience,
// impulsiveness, discipline) so every section of the demo report is rich.
function demoResponses(): AssessmentResponses {
  const responses: AssessmentResponses = {};
  const weakDims = new Set(["patience", "impulsiveness", "discipline", "emotionalRegulation"]);
  for (const q of ASSESSMENT_QUESTIONS) {
    const weak = weakDims.has(q.dimension);
    // For weak dimensions, answer "unhealthily"; otherwise moderately healthy.
    let v: LikertValue;
    if (weak) v = (q.reverse ? 4 : 2) as LikertValue;
    else v = (q.reverse ? 2 : 4) as LikertValue;
    responses[q.id] = v;
  }
  return responses;
}

interface DemoData {
  profile: UserProfile;
  report: Report;
  plan?: PlanProgress;
}

let DATA: DemoData | null = null;

function seed(): DemoData {
  const report = generateReport(DEMO_UID, demoResponses());
  report.ai = {
    interpretation:
      "You are The Chaser. When the market runs, something in you refuses to be left behind — and your weakest dimensions, patience and impulse control, are exactly the ones that let the chase win. You don't lack knowledge; you lack the tolerance for missing out.\n\nThe pattern is reliable: you miss a clean entry, watch price leave, and override your plan to climb aboard a move that's already exhausted. The loss that follows confirms a false belief — that you simply have to be faster.\n\nThe single shift that changes everything: treat a missed move as a non-event. Your edge is in the next clean setup, not the one that left without you.",
    nafsNarrative:
      "Your dominant inner battle is greed — not for money exactly, but for not missing out. Beneath the chasing is impatience: an inability to sit in the discomfort of absence. The trade is only the symptom.",
    blueprintIntro:
      "Over the next 30 days you'll move from chasing extended moves toward letting them go and waiting for clean setups — one keystone commitment at a time, reported daily in your Discord room.",
  };

  const profile: UserProfile = {
    uid: DEMO_UID,
    email: "demo@niyyah.os",
    displayName: "Sam (Demo)",
    createdAt: new Date().toISOString(),
    tz: "UTC",
    assessmentCompleted: true,
    archetypeId: report.archetypeId,
    baselineArchetypeId: report.archetypeId,
    entitlement: { unlocked: true, codeRedeemed: "DEMO", redeemedAt: new Date().toISOString() },
  };

  const plan: PlanProgress = {
    startDate: daysAgoKey(6),
    completed: [1, 2, 3, 4, 5],
    updatedAt: new Date().toISOString(),
  };

  return { profile, report, plan };
}

export function demo(): DemoData {
  if (!DATA) DATA = seed();
  return DATA;
}

export const DEMO_USER = {
  uid: DEMO_UID,
  email: "demo@niyyah.os",
  displayName: "Sam (Demo)",
};
