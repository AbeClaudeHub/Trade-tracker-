import type { Archetype, Blueprint, BlueprintWeek } from "@/domain/types";

/**
 * Shared 4-week behavior-change scaffold (awareness → interruption →
 * replacement → consolidation), filled with archetype-specific content so the
 * resulting plan is concrete and personal rather than generic.
 */
type WeekScaffold = (t: Archetype["transformation"]) => Omit<BlueprintWeek, "week">;

const SCAFFOLD: WeekScaffold[] = [
  (t) => ({
    theme: "Awareness",
    goal: `See ${t.signatureBehavior.toLowerCase()} clearly, without judgement, and report it honestly every day.`,
    dailyPractice: `Notice every time the urge toward ${t.signatureBehavior.toLowerCase()} appears. Name it. Don't fight it yet — just observe.`,
    discordPrompt: t.dailyDiscordReport,
    milestone: "Seven consecutive days of honest daily check-ins in your room.",
  }),
  (t) => ({
    theme: "Interruption",
    goal: `Insert a deliberate pause between the trigger and the behavior.`,
    dailyPractice: `When the urge hits, stop and breathe before you act. Hold the line: "${t.keystoneCommitment}"`,
    discordPrompt: `Report each moment you interrupted the pattern today — and each moment you didn't.`,
    milestone: "Interrupt your loop at least five times this week.",
  }),
  (t) => ({
    theme: "Replacement",
    goal: `Install ${t.replacementBehavior.toLowerCase()} as your default response.`,
    dailyPractice: `Practise ${t.replacementBehavior.toLowerCase()} on purpose. Make the disciplined choice the easy one.`,
    discordPrompt: `Report whether ${t.replacementBehavior.toLowerCase()} held up today.`,
    milestone: "Three consecutive clean days, reported in your room.",
  }),
  (t) => ({
    theme: "Consolidation",
    goal: `Make discipline your identity, not your daily effort.`,
    dailyPractice: `Execute on autopilot. Keep your keystone: "${t.keystoneCommitment}"`,
    discordPrompt: `Report your streak and one thing these 30 days taught you about yourself.`,
    milestone: "Finish 30 days with your keystone commitment intact.",
  }),
];

export function buildBlueprint(archetype: Archetype): Blueprint {
  const weeks: BlueprintWeek[] = SCAFFOLD.map((fn, i) => ({
    week: i + 1,
    ...fn(archetype.transformation),
  }));
  return {
    weeks,
    keystoneCommitment: archetype.transformation.keystoneCommitment,
  };
}
