import type { CommitmentTemplate } from "@/domain/types";

/**
 * The daily commitment catalog. A commitment is an implementation intention
 * made BEFORE the session and measured AFTER it. Each maps to the violation it
 * guards against and the nafs it tends to involve.
 */
export const COMMITMENT_TEMPLATES: CommitmentTemplate[] = [
  {
    id: "no_revenge_trading",
    label: "No revenge trading",
    description: "I will not trade to get back a loss.",
    mappedViolation: "revengeTraded",
    nafsHints: ["ego", "fear"],
  },
  {
    id: "max_trades",
    label: "Maximum 2 trades",
    description: "I will take no more than two trades today.",
    mappedViolation: "overtraded",
    nafsHints: ["impatience", "greed"],
  },
  {
    id: "respect_stop_loss",
    label: "Respect my stop losses",
    description: "I will not move or remove a stop.",
    mappedViolation: "movedStop",
    nafsHints: ["fear", "ego"],
  },
  {
    id: "no_impulsive_entries",
    label: "No impulsive entries",
    description: "I will check my criteria before every entry.",
    mappedViolation: "chasedEntries",
    nafsHints: ["impatience"],
  },
  {
    id: "follow_trading_plan",
    label: "Follow my trading plan",
    description: "I will execute only what my plan allows.",
    mappedViolation: "followedPlan",
    nafsHints: ["ego", "laziness"],
  },
  {
    id: "no_chasing_entries",
    label: "No chasing entries",
    description: "If price is past my entry, the trade is gone.",
    mappedViolation: "chasedEntries",
    nafsHints: ["greed", "validationSeeking"],
  },
  {
    id: "stop_after_max_loss",
    label: "Stop trading after max loss",
    description: "I will end my session at my daily loss limit.",
    mappedViolation: "brokeRiskRules",
    nafsHints: ["ego", "attachment"],
  },
  {
    id: "no_trade_day",
    label: "No trading today",
    description: "Sitting out is a disciplined choice. I will not trade.",
    nafsHints: ["impatience"],
  },
];

export const COMMITMENT_BY_ID: Record<string, CommitmentTemplate> =
  Object.fromEntries(COMMITMENT_TEMPLATES.map((t) => [t.id, t]));
