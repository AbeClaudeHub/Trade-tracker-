/**
 * Niyyah OS — domain model (v3: premium behavioral diagnosis product).
 *
 * Niyyah OS is sold to traders inside existing Discord accountability rooms.
 * It does not track behavior over time or replace the rooms. It runs one deep
 * assessment and produces a personal diagnosis + a 30-day transformation
 * blueprint the trader executes *through* his Discord room.
 */

// ───────────────────────────── Behavioral dimensions ─────────────────────────

export type BehavioralDimension =
  | "discipline"
  | "patience"
  | "risk"
  | "ego"
  | "fear"
  | "impulsiveness"
  | "consistency"
  | "accountability"
  | "emotionalRegulation";

export const BEHAVIORAL_DIMENSIONS: BehavioralDimension[] = [
  "discipline",
  "patience",
  "risk",
  "ego",
  "fear",
  "impulsiveness",
  "consistency",
  "accountability",
  "emotionalRegulation",
];

export const DIMENSION_LABELS: Record<BehavioralDimension, string> = {
  discipline: "Discipline",
  patience: "Patience",
  risk: "Risk Behavior",
  ego: "Ego",
  fear: "Fear",
  impulsiveness: "Impulsiveness",
  consistency: "Consistency",
  accountability: "Accountability",
  emotionalRegulation: "Emotional Regulation",
};

export type DimensionScores = Record<BehavioralDimension, number>;

// ───────────────────────────────── Nafs ──────────────────────────────────────

export type NafsCategory =
  | "greed"
  | "fear"
  | "ego"
  | "impatience"
  | "attachment"
  | "validationSeeking"
  | "laziness"
  | "overconfidence";

export const NAFS_CATEGORIES: NafsCategory[] = [
  "greed",
  "fear",
  "ego",
  "impatience",
  "attachment",
  "validationSeeking",
  "laziness",
  "overconfidence",
];

export const NAFS_LABELS: Record<NafsCategory, string> = {
  greed: "Greed",
  fear: "Fear",
  ego: "Ego",
  impatience: "Impatience",
  attachment: "Attachment to Outcomes",
  validationSeeking: "Validation Seeking",
  laziness: "Laziness",
  overconfidence: "Overconfidence",
};

/** Per-nafs tendency, 0–100 (higher = stronger pull / bigger battle). */
export type NafsScores = Record<NafsCategory, number>;

// ───────────────────────────────── Assessment ────────────────────────────────

export interface AssessmentQuestion {
  id: string;
  dimension: BehavioralDimension;
  prompt: string;
  reverse: boolean;
  weight: number; // 1–3
}

export type LikertValue = 1 | 2 | 3 | 4 | 5;
export type AssessmentResponses = Record<string, LikertValue>;

// ───────────────────────────────── Archetypes ────────────────────────────────

export type ArchetypeId =
  | "chaser"
  | "gambler"
  | "avenger"
  | "hesitator"
  | "perfectionist"
  | "overconfident"
  | "validationSeeker"
  | "ruleBreaker";

export interface ArchetypeTransformation {
  /** The behavior that defines this archetype's sabotage. */
  signatureBehavior: string;
  /** The behavior we install to replace it. */
  replacementBehavior: string;
  /** The single keystone commitment for the 30 days. */
  keystoneCommitment: string;
  /** A tailored line for the daily Discord check-in. */
  dailyDiscordReport: string;
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  commonMistakes: string[]; // common rule violations
  emotionalTriggers: string[];
  recommendations: string[];
  accountabilityWeaknesses: string[];
  rootCauses: string[];
  /** The canonical self-sabotage loop, as ordered steps. */
  selfSabotageLoop: string[];
  /** The nafs that typically drive this archetype. */
  nafsRoots: NafsCategory[];
  /** Specific commitments recommended for this archetype (plain text). */
  recommendedCommitments: string[];
  /** Behaviors to monitor / report on in the Discord room. */
  monitorBehaviors: string[];
  transformation: ArchetypeTransformation;
  /** Dimension fingerprint — weak dimensions pull toward this archetype. */
  fingerprint: Partial<Record<BehavioralDimension, number>>;
}

// ────────────────────────────── 30-day blueprint ─────────────────────────────

export interface BlueprintWeek {
  week: number;
  theme: string;
  goal: string;
  dailyPractice: string;
  discordPrompt: string;
  milestone: string;
}

export interface Blueprint {
  weeks: BlueprintWeek[];
  keystoneCommitment: string;
  intro?: string; // optional AI-personalised intro
}

// ───────────────────────────── Discord bridge ────────────────────────────────

export interface DiscordPlan {
  dailyReportScript: string;
  commitments: string[];
  focusWeaknesses: string[];
  monitorBehaviors: string[];
  briefingCard: string;
}

// ─────────────────────────── Self-sabotage loop ──────────────────────────────

export interface SabotageLoop {
  title: string;
  steps: string[];
}

// ─────────────────────────────── The report ──────────────────────────────────

/**
 * The single generated artifact — the product. Created once from an assessment,
 * persisted, and rendered as the web report + PDF + share cards.
 */
export interface Report {
  id: string;
  userId: string;
  generatedAt: string;

  responses: AssessmentResponses;
  dimensionScores: DimensionScores;
  nafsScores: NafsScores;
  dominantNafs: NafsCategory;
  secondaryNafs: NafsCategory | null;

  archetypeId: ArchetypeId;
  secondaryArchetypeId: ArchetypeId | null;

  loops: SabotageLoop[];
  discord: DiscordPlan;
  blueprint: Blueprint;

  /** AI-personalised prose. Falls back to deterministic text when AI is off. */
  ai?: {
    interpretation?: string;
    nafsNarrative?: string;
    blueprintIntro?: string;
  };
}

// ───────────────────────────────── User ──────────────────────────────────────

export interface Entitlement {
  unlocked: boolean;
  codeRedeemed: string | null;
  redeemedAt: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  tz: string;
  assessmentCompleted: boolean;
  archetypeId: ArchetypeId | null;
  baselineArchetypeId: ArchetypeId | null;
  entitlement: Entitlement;
}

export interface LicenseCode {
  code: string;
  batch: string;
  used: boolean;
  usedBy: string | null;
  createdAt: string;
  usedAt: string | null;
}
