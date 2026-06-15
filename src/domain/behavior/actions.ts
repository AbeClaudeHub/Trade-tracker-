import type { BehaviorAction, BehaviorActionId } from "@/domain/types";

/**
 * The behavior scoring vocabulary (v2). No PnL, no win rate — behavior only.
 * Affirmations add; violations subtract. Revenge trading and broken risk rules
 * are the most damaging (-3). Every violation routes into Nafs categorisation.
 */
export const BEHAVIOR_ACTIONS: Record<BehaviorActionId, BehaviorAction> = {
  followedPlan: {
    id: "followedPlan",
    label: "Followed my plan",
    description: "I executed according to my plan, start to finish.",
    points: 1,
    isViolation: false,
    dimension: "discipline",
  },
  honoredStop: {
    id: "honoredStop",
    label: "Honored my stop",
    description: "I took the loss where I said I would. No negotiation.",
    points: 1,
    isViolation: false,
    dimension: "discipline",
  },
  respectedMaxLoss: {
    id: "respectedMaxLoss",
    label: "Respected my max loss",
    description: "I stopped when I hit my daily limit.",
    points: 1,
    isViolation: false,
    dimension: "risk",
  },
  waitedForSetup: {
    id: "waitedForSetup",
    label: "Waited for my setup",
    description: "I let the market come to me instead of forcing trades.",
    points: 1,
    isViolation: false,
    dimension: "patience",
  },
  completedReflection: {
    id: "completedReflection",
    label: "Completed my reflection",
    description: "I closed the day honestly.",
    points: 1,
    isViolation: false,
    dimension: "accountability",
  },

  revengeTraded: {
    id: "revengeTraded",
    label: "Revenge traded",
    description: "I traded to get back a loss, not because of a setup.",
    points: -3,
    isViolation: true,
    dimension: "emotionalRegulation",
    nafsHints: ["ego", "fear"],
  },
  brokeRiskRules: {
    id: "brokeRiskRules",
    label: "Broke my risk rules",
    description: "I oversized or exceeded my risk limits.",
    points: -3,
    isViolation: true,
    dimension: "risk",
    nafsHints: ["greed", "overconfidence"],
  },
  overtraded: {
    id: "overtraded",
    label: "Overtraded",
    description: "I took trades beyond my plan or for the sake of action.",
    points: -2,
    isViolation: true,
    dimension: "impulsiveness",
    nafsHints: ["impatience", "greed"],
  },
  movedStop: {
    id: "movedStop",
    label: "Moved my stop",
    description: "I widened or removed a stop to avoid taking the loss.",
    points: -2,
    isViolation: true,
    dimension: "discipline",
    nafsHints: ["fear", "ego"],
  },
  chasedEntries: {
    id: "chasedEntries",
    label: "Chased entries",
    description: "I entered late, into an extended move, off-plan.",
    points: -2,
    isViolation: true,
    dimension: "patience",
    nafsHints: ["greed", "validationSeeking"],
  },
};

export const AFFIRMING_ACTIONS: BehaviorAction[] = Object.values(
  BEHAVIOR_ACTIONS,
).filter((a) => !a.isViolation);

export const VIOLATION_ACTIONS: BehaviorAction[] = Object.values(
  BEHAVIOR_ACTIONS,
).filter((a) => a.isViolation);

export const ALL_BEHAVIOR_ACTIONS: BehaviorAction[] = Object.values(BEHAVIOR_ACTIONS);
