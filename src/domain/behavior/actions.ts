import type { BehaviorAction, BehaviorActionId } from "@/domain/types";

/**
 * The behavior actions logged in the post-market check-in.
 *
 * This is the entire scoring vocabulary of Niyyah OS. There is no PnL, no win
 * rate, no R-multiple — only behavior. Disciplined actions add; violations
 * subtract. Revenge trading is the single most damaging behavior (-2).
 */
export const BEHAVIOR_ACTIONS: Record<BehaviorActionId, BehaviorAction> = {
  followedRules: {
    id: "followedRules",
    label: "Followed my rules",
    description: "I executed according to my plan, start to finish.",
    points: 1,
    isViolation: false,
    dimension: "discipline",
  },
  waitedForSetup: {
    id: "waitedForSetup",
    label: "Waited for my setup",
    description: "I let the market come to me instead of forcing trades.",
    points: 1,
    isViolation: false,
    dimension: "patience",
  },
  honoredStop: {
    id: "honoredStop",
    label: "Honored my stop",
    description: "I took the loss where I said I would. No negotiation.",
    points: 1,
    isViolation: false,
    dimension: "discipline",
  },
  respectedRisk: {
    id: "respectedRisk",
    label: "Respected my risk",
    description: "I sized correctly and stayed within my limits.",
    points: 1,
    isViolation: false,
    dimension: "risk",
  },
  overtraded: {
    id: "overtraded",
    label: "Overtraded",
    description: "I took trades beyond my plan or for the sake of action.",
    points: -1,
    isViolation: true,
    dimension: "impulsiveness",
  },
  movedStop: {
    id: "movedStop",
    label: "Moved my stop",
    description: "I widened or removed a stop to avoid taking the loss.",
    points: -1,
    isViolation: true,
    dimension: "discipline",
  },
  revengeTraded: {
    id: "revengeTraded",
    label: "Revenge traded",
    description: "I traded to get back a loss, not because of a setup.",
    points: -2,
    isViolation: true,
    dimension: "emotionalRegulation",
  },
  chasedEntries: {
    id: "chasedEntries",
    label: "Chased entries",
    description: "I entered late, into an extended move, off-plan.",
    points: -1,
    isViolation: true,
    dimension: "patience",
  },
};

export const AFFIRMING_ACTIONS: BehaviorAction[] = Object.values(
  BEHAVIOR_ACTIONS,
).filter((a) => !a.isViolation);

export const VIOLATION_ACTIONS: BehaviorAction[] = Object.values(
  BEHAVIOR_ACTIONS,
).filter((a) => a.isViolation);

export const ALL_BEHAVIOR_ACTIONS: BehaviorAction[] =
  Object.values(BEHAVIOR_ACTIONS);
