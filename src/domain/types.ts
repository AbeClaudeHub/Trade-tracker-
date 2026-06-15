/**
 * Niyyah OS — domain model (v2: accountability-first).
 *
 * Behavior is the product. Nothing here tracks PnL, win rate, or market data.
 * The unit of change is the daily Commitment; the engine of change is the
 * Accountability Room; the language of progress is the Behavioral Score.
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
  secondaryArchetypeId: ArchetypeId | null;
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
  fingerprint: Partial<Record<BehavioralDimension, number>>;
}

// ──────────────────────────── Behavior actions ───────────────────────────────

/** A behavior toggled in the post-market review. Drives the score. */
export type BehaviorActionId =
  | "followedPlan"
  | "honoredStop"
  | "respectedMaxLoss"
  | "waitedForSetup"
  | "completedReflection"
  | "revengeTraded"
  | "overtraded"
  | "movedStop"
  | "chasedEntries"
  | "brokeRiskRules";

export interface BehaviorAction {
  id: BehaviorActionId;
  label: string;
  description: string;
  points: number; // positive = disciplined, negative = violation
  isViolation: boolean;
  dimension: BehavioralDimension;
  /** Default nafs categories this violation tends to stem from (suggestions). */
  nafsHints?: NafsCategory[];
}

// ─────────────────────────────── Nafs battle ─────────────────────────────────

/** The eight internal drivers ("nafs") behind behavioral violations. */
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
  attachment: "Attachment",
  validationSeeking: "Validation Seeking",
  laziness: "Laziness",
  overconfidence: "Overconfidence",
};

export interface NafsIncident {
  id: string;
  userId: string;
  date: string; // yyyy-MM-dd
  categories: NafsCategory[];
  sourceType: "violation" | "brokenCommitment";
  sourceRef: string; // BehaviorActionId or commitment id
  note?: string;
  intensity?: 1 | 2 | 3;
  createdAt: string;
}

/** Rolling per-category counts over a window. */
export type NafsTally = Record<NafsCategory, number>;

// ──────────────────────────── Daily commitments ──────────────────────────────

export interface CommitmentTemplate {
  id: string;
  label: string;
  description: string;
  /** The behavior this commitment guards against breaking. */
  mappedViolation?: BehaviorActionId;
  nafsHints: NafsCategory[];
}

export type CommitmentStatus = "pending" | "honored" | "broken";

export interface Commitment {
  id: string;
  templateId: string | null; // null = custom
  text: string;
  mappedViolation?: BehaviorActionId;
  nafsTags: NafsCategory[];
  status: CommitmentStatus;
  note?: string;
}

// ──────────────────────────── Daily entry (v2) ───────────────────────────────

export interface PreMarketEntry {
  feeling: string;
  plan: string;
  sabotageRisk: string;
  emotionalState: LikertValue;
}

export interface PostMarketReview {
  followedRules: boolean;
  violatedRisk: boolean;
  emotionsAffectedDecisions: boolean;
  learned: string;
}

export interface DailyEntry {
  id: string; // yyyy-MM-dd
  userId: string;
  date: string; // yyyy-MM-dd
  createdAt: string;

  committedAt?: string; // ISO — when commitments were posted
  reviewedAt?: string; // ISO — when the review was completed

  commitments: Commitment[];
  preMarket?: PreMarketEntry;
  postMarket?: PostMarketReview;
  actions: BehaviorActionId[];

  // Derived at write-time for fast reads
  dayScore: number; // 0–100
  honoredRate: number; // 0–1
  hadViolation: boolean;
}

// ──────────────────────────────── Scoring ────────────────────────────────────

/** Live behavioral indices — the user's headline KPIs. */
export interface BehaviorIndices {
  disciplineScore: number; // 0–100, EWMA hero KPI
  consistencyScore: number; // 0–100, % days showed up
  nafsControlIndex: number; // 0–100, fewer internal-battle losses = higher
  completionRate: number; // 0–1, commitments honored
  currentStreak: number; // clean days in a row
  longestStreak: number;
  lastComputedDate: string;
}

export interface GrowthSummary {
  windowDays: number;
  disciplineDelta: number;
  violationReductionPct: number; // vs baseline window
}

export interface ScoreWindow {
  days: number;
  averageDayScore: number;
  violations: number;
  affirmations: number;
  honoredRate: number;
}

export interface BehaviorTrendPoint {
  date: string;
  dayScore: number;
}

// ─────────────────────────────── Interventions ───────────────────────────────

export type InterventionType =
  | "patternWarning"
  | "extraReflection"
  | "mandatoryReview"
  | "commitmentReset"
  | "focusChallenge"
  | "partnerNotification";

export type InterventionTrigger =
  | "sameViolationRepeat"
  | "commitmentRelapse"
  | "scoreDrop"
  | "nafsSpike"
  | "disappearance"
  | "streakBreakAfterLong";

export type InterventionStatus = "active" | "acknowledged" | "resolved" | "expired";

export interface Intervention {
  id: string;
  userId: string;
  type: InterventionType;
  trigger: InterventionTrigger;
  title: string;
  message: string;
  escalationLevel: number; // 1–6
  status: InterventionStatus;
  createdAt: string;
  dueAt?: string;
  cooldownUntil?: string;
  resolutionNote?: string;
}

// ─────────────────────────── Pattern detection ───────────────────────────────

export type PatternSeverity = "insight" | "watch" | "alert";

export interface DetectedPattern {
  id: string;
  title: string;
  detail: string;
  severity: PatternSeverity;
  confidence: number; // 0–1
  /** Optional trigger this pattern should raise. */
  trigger?: InterventionTrigger;
}

// ─────────────────────────── Identity evolution ──────────────────────────────

export interface IdentitySnapshot {
  id: string; // period key
  userId: string;
  takenAt: string;
  dimensionScores: DimensionScores; // behavior-derived
  archetypeId: ArchetypeId;
  nafsTally: NafsTally;
}

export interface TransformationReport {
  baselineArchetypeId: ArchetypeId;
  currentArchetypeId: ArchetypeId;
  daysTracked: number;
  disciplineDelta: number;
  violationReductionPct: number;
  emotionalViolationReductionPct: number;
  dominantNafsBefore: NafsCategory | null;
  dominantNafsNow: NafsCategory | null;
  dimensionDeltas: Partial<Record<BehavioralDimension, number>>;
}

// ───────────────────────────── Weekly reflection ─────────────────────────────

export interface WeeklyReflection {
  id: string; // yyyy-Www
  userId: string;
  weekStart: string;
  createdAt: string;
  improved: string;
  repeated: string;
  triggers: string;
  nextWeek: string;
  summary?: string;
  /** Whether shared to the room feed. */
  sharedToRoom?: boolean;
}

// ───────────────────────────────── Rooms ─────────────────────────────────────

export type RoomMemberRole = "owner" | "moderator" | "member";

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  memberCount: number;
  cutoffLocalTime: string; // "16:30"
  tzAnchor: string; // IANA tz
  encouragedTemplates: string[];
  commitmentOfWeek?: { templateId: string; weekStart: string };
  createdAt: string;
}

export interface MemberSharing {
  score: boolean;
  nafs: boolean;
  reflections: boolean;
}

export interface RoomMember {
  uid: string;
  roomId: string;
  role: RoomMemberRole;
  displayName: string;
  archetypeId: ArchetypeId | null;
  joinedAt: string;
  streak: number;
  lastActiveDate: string | null;
  sharing: MemberSharing;
  weeklyPartnerUid: string | null; // rotating in-room pairing
}

export type DayState =
  | "committed"
  | "awaitingReview"
  | "followedThrough"
  | "repeatedMistake"
  | "improved"
  | "absent";

/** Denormalised board row a member writes for themselves, consent-filtered. */
export interface BoardRow {
  uid: string;
  date: string;
  displayName: string;
  state: DayState;
  committedCount: number;
  reviewed: boolean;
  honoredRate: number | null; // null if not shared
  dayScore: number | null; // null if not shared
  streak: number;
  trend: "up" | "flat" | "down";
  topNafs: NafsCategory | null; // null if not shared
  updatedAt: string;
}

export type RoomFeedType =
  | "commitment"
  | "review"
  | "nudge"
  | "attestation"
  | "sharedReflection"
  | "milestone";

/** Fixed, structured nudge vocabulary — no free text, ever. */
export type NudgeKind = "respect" | "stayStrong" | "checkIn" | "proudOfYou";

export interface RoomFeedEvent {
  id: string;
  roomId: string;
  type: RoomFeedType;
  fromUid: string;
  toUid?: string;
  date: string;
  createdAt: string;
  nudgeKind?: NudgeKind;
  text?: string; // only for sharedReflection excerpts / structured reviews
}

export interface RoomRollup {
  avgDiscipline: number;
  completionRate: number;
  cleanDaysWeek: number;
  violationReductionPct: number;
  reviewStreak: number;
  mostImprovedUid: string | null;
  biggestBattle: NafsCategory | null;
  updatedAt: string;
}

export interface PartnerReview {
  id: string;
  roomId: string;
  fromUid: string;
  toUid: string;
  weekStart: string;
  acknowledgement: string;
  oneThingWorking: string;
  oneThingToConfront: string;
  encouragement: string;
  createdAt: string;
}

// ───────────────────────────────── User profile ──────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  tz: string; // IANA timezone
  assessmentCompleted: boolean;
  archetypeId: ArchetypeId | null;
  baselineArchetypeId: ArchetypeId | null;
  roomIds: string[];
  indices?: BehaviorIndices;
}
