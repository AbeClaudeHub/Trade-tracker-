/**
 * Niyyah OS — domain model.
 *
 * Behavior is the product. Nothing in this model tracks PnL, win rate, or
 * market data. Everything models the trader's *behavior* and self-awareness.
 */

// ───────────────────────────── Behavioral dimensions ─────────────────────────

/** The nine behavioral dimensions measured across the platform. */
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

/** Per-dimension score, normalised 0–100 (higher = healthier behavior). */
export type DimensionScores = Record<BehavioralDimension, number>;

// ───────────────────────────────── Assessment ────────────────────────────────

/**
 * A single Likert assessment question. `weight` reflects how diagnostic the
 * item is for its dimension. `reverse` items are phrased so that agreement
 * indicates *unhealthy* behavior, and are inverted during scoring.
 */
export interface AssessmentQuestion {
  id: string;
  dimension: BehavioralDimension;
  prompt: string;
  reverse: boolean;
  weight: number; // 1–3
}

/** Likert response, 1 (strongly disagree) → 5 (strongly agree). */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type AssessmentResponses = Record<string, LikertValue>;

export interface AssessmentResult {
  id: string;
  userId: string;
  completedAt: string; // ISO
  responses: AssessmentResponses;
  dimensionScores: DimensionScores;
  archetypeId: ArchetypeId;
  /** Secondary archetype — the next-strongest pull. */
  secondaryArchetypeId: ArchetypeId | null;
  /** Optional AI-generated interpretation of the result. */
  interpretation?: string;
}

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

export interface Archetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  commonMistakes: string[];
  emotionalTriggers: string[];
  recommendations: string[];
  /**
   * Dimension fingerprint. For each dimension, a negative weight means low
   * scores on that dimension pull a trader toward this archetype.
   */
  fingerprint: Partial<Record<BehavioralDimension, number>>;
}

// ──────────────────────────── Daily accountability ───────────────────────────

export interface PreMarketEntry {
  feeling: string;
  plan: string;
  sabotageRisk: string;
  /** 1–5 self-rated emotional intensity at open. */
  emotionalState: LikertValue;
}

export interface PostMarketEntry {
  followedRules: boolean;
  violatedRisk: boolean;
  emotionsAffectedDecisions: boolean;
  learned: string;
}

/** A behavior action toggled in the post-market check-in. */
export type BehaviorActionId =
  | "followedRules"
  | "waitedForSetup"
  | "honoredStop"
  | "respectedRisk"
  | "overtraded"
  | "movedStop"
  | "revengeTraded"
  | "chasedEntries";

export interface BehaviorAction {
  id: BehaviorActionId;
  label: string;
  description: string;
  points: number; // positive = disciplined, negative = violation
  /** Whether selecting this counts as a behavioral violation. */
  isViolation: boolean;
  dimension: BehavioralDimension;
}

export interface DailyEntry {
  id: string; // yyyy-MM-dd
  userId: string;
  date: string; // yyyy-MM-dd (the trading day)
  createdAt: string; // ISO
  preMarket?: PreMarketEntry;
  postMarket?: PostMarketEntry;
  /** Behavior actions selected during the post-market review. */
  actions: BehaviorActionId[];
  /** Computed behavior score for the day. */
  score: number;
  /** Convenience flags derived at write-time for fast queries. */
  hadViolation: boolean;
}

// ───────────────────────────── Weekly reflection ─────────────────────────────

export interface WeeklyReflection {
  id: string; // yyyy-'W'ww
  userId: string;
  weekStart: string; // yyyy-MM-dd (Monday)
  createdAt: string;
  improved: string;
  repeated: string;
  triggers: string;
  nextWeek: string;
  /** Optional AI-generated summary of the week. */
  summary?: string;
}

// ──────────────────────────────── Behavior score ─────────────────────────────

export interface ScoreWindow {
  total: number;
  days: number;
  average: number;
  violations: number;
  affirmations: number;
}

export interface BehaviorTrendPoint {
  date: string; // yyyy-MM-dd
  score: number;
}

// ─────────────────────────────── Pattern detection ───────────────────────────

export type PatternSeverity = "insight" | "watch" | "alert";

export interface DetectedPattern {
  id: string;
  title: string;
  detail: string;
  severity: PatternSeverity;
  /** 0–1 confidence based on sample size + effect strength. */
  confidence: number;
}

// ───────────────────────────────── Partner ───────────────────────────────────

export type PartnerLinkStatus = "pending" | "active" | "declined";

export interface PartnerLink {
  id: string;
  /** The two user ids in the pair, sorted. */
  members: [string, string];
  requestedBy: string;
  status: PartnerLinkStatus;
  createdAt: string;
}

export interface PartnerFeedback {
  id: string;
  linkId: string;
  fromUserId: string;
  toUserId: string;
  weekStart: string;
  message: string;
  createdAt: string;
}

// ───────────────────────────────── User profile ──────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  assessmentCompleted: boolean;
  archetypeId: ArchetypeId | null;
  /** Visibility consent for an accountability partner. */
  partnerVisibility: {
    behaviorScore: boolean;
    reflections: boolean;
  };
  /**
   * Denormalised, consent-gated snapshot a partner is allowed to see. Written
   * only with fields the user has opted to share; absent fields stay private.
   */
  sharedSummary?: SharedSummary;
}

export interface SharedSummary {
  updatedAt: string;
  weeklyScore?: number;
  streak?: number;
  lastReflectionExcerpt?: string;
}
