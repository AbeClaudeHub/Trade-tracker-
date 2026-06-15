import {
  DIMENSION_LABELS,
  NAFS_LABELS,
  type AssessmentResponses,
  type DiscordPlan,
  type Report,
  type SabotageLoop,
} from "@/domain/types";
import { rankDimensions, scoreAssessment } from "@/domain/assessment/scoring";
import { resolveArchetype } from "@/domain/archetypes/engine";
import { ARCHETYPES } from "@/domain/archetypes/data";
import {
  computeNafsScores,
  dominantNafs as topNafs,
  secondaryNafs as nextNafs,
} from "@/domain/nafs/profile";
import { buildBlueprint } from "@/domain/blueprint/build";

/**
 * Generate the full behavioral report deterministically from assessment
 * responses. AI personalisation is layered on afterwards (and is optional).
 */
export function generateReport(
  userId: string,
  responses: AssessmentResponses,
): Report {
  const dimensionScores = scoreAssessment(responses);
  const { primary, secondary } = resolveArchetype(dimensionScores);
  const archetype = ARCHETYPES[primary];

  const nafsScores = computeNafsScores(dimensionScores);
  const dominantNafs = topNafs(nafsScores);
  const secondaryNafs = nextNafs(nafsScores);

  // Self-sabotage loops: the primary archetype's loop, plus the secondary's if
  // it's a meaningfully different identity.
  const loops: SabotageLoop[] = [
    { title: `The ${archetype.name} loop`, steps: archetype.selfSabotageLoop },
  ];
  if (secondary) {
    const sec = ARCHETYPES[secondary];
    loops.push({ title: `A second loop: ${sec.name}`, steps: sec.selfSabotageLoop });
  }

  const weakest = rankDimensions(dimensionScores)
    .slice(0, 2)
    .map((d) => DIMENSION_LABELS[d.dimension]);

  const discord: DiscordPlan = {
    dailyReportScript: [
      "📋 Daily accountability check-in",
      `• Commitment: ${archetype.transformation.keystoneCommitment}`,
      `• ${archetype.transformation.dailyDiscordReport}`,
      `• Today's biggest internal battle: ${NAFS_LABELS[dominantNafs]}`,
      "• Did I honor my rules today? (Yes/No + one honest sentence)",
    ].join("\n"),
    commitments: archetype.recommendedCommitments,
    focusWeaknesses: [...weakest, ...archetype.accountabilityWeaknesses.slice(0, 1)],
    monitorBehaviors: archetype.monitorBehaviors,
    briefingCard: [
      `I'm ${archetype.name}. ${archetype.tagline}`,
      `Hold me accountable for: ${archetype.transformation.signatureBehavior.toLowerCase()}.`,
      `Call me out if you see: ${archetype.monitorBehaviors.join(", ").toLowerCase()}.`,
      `My commitment: "${archetype.transformation.keystoneCommitment}"`,
    ].join("\n"),
  };

  return {
    id: `report-${Date.now()}`,
    userId,
    generatedAt: new Date().toISOString(),
    responses,
    dimensionScores,
    nafsScores,
    dominantNafs,
    secondaryNafs,
    archetypeId: primary,
    secondaryArchetypeId: secondary,
    loops,
    discord,
    blueprint: buildBlueprint(archetype),
  };
}
