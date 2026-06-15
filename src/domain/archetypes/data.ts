import type { Archetype, ArchetypeId } from "@/domain/types";

/**
 * The eight trader archetypes — behavioral identities, not strategies. Each
 * carries the full diagnostic content the report renders: strengths, blind
 * spots, common violations, triggers, accountability weaknesses, root causes,
 * the canonical self-sabotage loop, nafs roots, and a 30-day transformation
 * scaffold. Written to feel personal and true, never shaming.
 */
export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  chaser: {
    id: "chaser",
    name: "The Chaser",
    tagline: "You hate watching the move leave without you.",
    description:
      "You see opportunity everywhere, and that is both your gift and your wound. When price runs, something in you refuses to be left behind — so you enter late, into extended moves, paying the worst price for the privilege of feeling involved. The chase is rarely about the trade. It's about not being able to tolerate the feeling of missing out.",
    strengths: [
      "You are alert, engaged, and rarely miss what's happening in the market.",
      "You act decisively once you commit.",
      "Your appetite for opportunity is a real asset once channeled.",
    ],
    blindSpots: [
      "You confuse motion with progress — being in a trade feels like winning.",
      "You enter after the edge has already been priced in.",
      "FOMO overrides your plan in the moments that matter most.",
    ],
    commonMistakes: [
      "Buying tops after a move is already exhausted.",
      "Abandoning entry criteria to 'get in before it's too late.'",
      "Stacking chase-trades after watching others post gains.",
    ],
    emotionalTriggers: ["A fast, vertical move", "Others posting wins you 'missed'", "The feeling of being left out"],
    recommendations: [
      "Define the exact entry window. If price is past it, the trade is gone — and that is allowed.",
      "Keep a 'missed it on purpose' note. Reward the trades you didn't chase.",
    ],
    accountabilityWeaknesses: [
      "You under-report the trades you chased because they feel embarrassing.",
      "You frame FOMO entries as 'conviction' after the fact.",
    ],
    rootCauses: [
      "A low tolerance for missing out — absence feels like loss.",
      "Equating activity with worth.",
    ],
    selfSabotageLoop: [
      "Miss the clean entry",
      "Watch price run without you",
      "Feel the urge to not be left behind",
      "Chase a late, extended entry",
      "Get trapped as it reverses",
      "Confirm the belief that you 'have to be fast'",
    ],
    nafsRoots: ["greed", "impatience", "validationSeeking"],
    recommendedCommitments: [
      "No entries outside my defined window.",
      "Maximum 2 trades today.",
      "If I miss a move, I journal it instead of chasing it.",
    ],
    monitorBehaviors: ["Late entries", "Trades taken within minutes of a missed move"],
    transformation: {
      signatureBehavior: "Chasing extended moves you missed",
      replacementBehavior: "Letting missed moves go and waiting for the next clean setup",
      keystoneCommitment: "I only enter inside my defined window.",
      dailyDiscordReport: "Did I chase anything today? If I missed a move, how did I handle the urge?",
    },
    fingerprint: { patience: -3, impulsiveness: -2, fear: -1, discipline: -1 },
  },

  gambler: {
    id: "gambler",
    name: "The Gambler",
    tagline: "The thrill is the point — and that's the problem.",
    description:
      "For you, the market is alive in a way it isn't for most people. The uncertainty is intoxicating. You size up when conviction spikes, you take the trade for the rush as much as the reason, and the line between trading and gambling can quietly disappear. You have real edge — but the part of you that craves action keeps undoing the part that knows better.",
    strengths: [
      "You're comfortable with uncertainty that paralyses others.",
      "You can pull the trigger without endless hesitation.",
      "Disciplined, your risk tolerance becomes genuine courage.",
    ],
    blindSpots: [
      "You size by feeling, not by formula.",
      "The dopamine of action matters more than setup quality.",
      "You mistake variance for skill after a hot streak.",
    ],
    commonMistakes: ["Oversizing on 'sure things.'", "Trading for stimulation in dead markets.", "Letting one conviction trade damage the account."],
    emotionalTriggers: ["Boredom and flat markets", "A surge of certainty", "The desire to feel something"],
    recommendations: [
      "Fix risk per trade as a hard rule — conviction never changes size.",
      "Name whether you want action or have a setup before entering.",
    ],
    accountabilityWeaknesses: [
      "You report wins loudly and oversized losses quietly.",
      "You rationalise impulse trades as 'reads.'",
    ],
    rootCauses: ["A need for stimulation and intensity.", "Tying aliveness to risk."],
    selfSabotageLoop: [
      "Feel restless or flat",
      "Crave the rush of a position",
      "Take an outsized, conviction-driven trade",
      "Ride the adrenaline regardless of the plan",
      "Take an outsized loss",
      "Chase the next hit to feel alive again",
    ],
    nafsRoots: ["greed", "overconfidence", "attachment"],
    recommendedCommitments: [
      "Fixed risk per trade, no exceptions.",
      "No trades taken purely out of boredom.",
      "I log the feeling behind every entry.",
    ],
    monitorBehaviors: ["Position size variance", "Trades taken in flat markets"],
    transformation: {
      signatureBehavior: "Sizing by feeling and trading for the rush",
      replacementBehavior: "Fixed-risk, setup-only execution",
      keystoneCommitment: "My risk per trade is fixed regardless of conviction.",
      dailyDiscordReport: "Did I size by rule today? Did I trade for a setup or for the rush?",
    },
    fingerprint: { risk: -3, impulsiveness: -2, emotionalRegulation: -1, discipline: -1 },
  },

  avenger: {
    id: "avenger",
    name: "The Avenger",
    tagline: "You don't trade the market — you trade your last loss.",
    description:
      "When the market takes from you, you want it back, and you want it back now. Revenge trading is your signature: a loss lands, the pain spikes, and the next trade is no longer a decision — it's a counterattack. You are intense and you care deeply about winning. But the need to get even turns a single loss into a cascade.",
    strengths: ["You're tenacious and refuse to be beaten.", "You feel deeply, which fuels commitment.", "Aimed inward, your competitiveness is powerful."],
    blindSpots: ["A loss feels like a personal attack.", "Your worst trades cluster after painful ones.", "You escalate size to 'make it back fast.'"],
    commonMistakes: ["Re-entering immediately after a stop-out, on tilt.", "Doubling size to recover in one trade.", "Trading past your daily limit when down."],
    emotionalTriggers: ["A loss that felt unfair", "Being stopped out before a reversal", "Ending the day red"],
    recommendations: [
      "Install a mandatory cooldown after any loss beyond a threshold.",
      "Set a hard daily loss limit that ends your session automatically.",
    ],
    accountabilityWeaknesses: [
      "You hide tilt sessions out of shame.",
      "You blame 'manipulation' rather than your reaction to the loss.",
    ],
    rootCauses: ["An ego that experiences a loss as a personal defeat.", "Unprocessed frustration seeking immediate discharge."],
    selfSabotageLoop: [
      "Take a painful loss",
      "Feel attacked and need to get even",
      "Re-enter immediately, oversized, on tilt",
      "Take another loss",
      "Frustration compounds",
      "Revenge trade until the day is destroyed",
    ],
    nafsRoots: ["ego", "fear", "attachment"],
    recommendedCommitments: [
      "Mandatory 15-minute walk after any stop-out.",
      "Hard daily loss limit — session ends, no exceptions.",
      "No re-entry within 10 minutes of a loss.",
    ],
    monitorBehaviors: ["Re-entries after losses", "Size increases when down"],
    transformation: {
      signatureBehavior: "Revenge trading after a loss",
      replacementBehavior: "A deliberate cooldown that breaks the tilt",
      keystoneCommitment: "After any loss beyond my threshold, I step away before I act.",
      dailyDiscordReport: "Did I revenge trade today? How did I handle my first loss?",
    },
    fingerprint: { emotionalRegulation: -3, risk: -2, ego: -1, discipline: -1 },
  },

  hesitator: {
    id: "hesitator",
    name: "The Hesitator",
    tagline: "You see the setup clearly — and freeze.",
    description:
      "You often know exactly what to do, and then watch yourself not do it. Fear of being wrong keeps your finger off the trigger until the move is gone — at which point you chase it, completing the cruelest loop in trading. Your caution is a strength wearing the mask of a weakness.",
    strengths: ["You're thoughtful and rarely reckless.", "You respect risk instinctively.", "Your patience is real — it just tips into paralysis."],
    blindSpots: ["You treat a valid loss as a personal failure to avoid at all costs.", "You demand certainty the market won't give.", "Your missed trades hurt more than your losses — but you don't log them."],
    commonMistakes: ["Skipping valid setups and chasing them later.", "Cutting winners early out of fear.", "Over-analysing until the opportunity passes."],
    emotionalTriggers: ["The moment of committing capital", "A recent loss", "Ambiguity in the setup"],
    recommendations: [
      "Pre-commit: when criteria are met, you take it. Decide before, not during.",
      "Trade a defined small size while rebuilding trust in your execution.",
    ],
    accountabilityWeaknesses: [
      "You don't report missed setups, so your real leak stays invisible.",
      "You downplay hesitation as 'discipline.'",
    ],
    rootCauses: ["Fear of being wrong outweighing the cost of inaction.", "Perfectionism about entries."],
    selfSabotageLoop: [
      "Spot a valid setup",
      "Hesitate, waiting for certainty",
      "Watch the move leave without you",
      "Feel the regret of missing out",
      "Chase the next move impulsively",
      "Confirm the belief that you 'can't pull the trigger'",
    ],
    nafsRoots: ["fear", "validationSeeking"],
    recommendedCommitments: [
      "When my criteria are met, I take the trade — no extra confirmation.",
      "I log every valid setup I skipped as a cost.",
      "Defined small size on every entry this week.",
    ],
    monitorBehaviors: ["Skipped valid setups", "Winners cut early"],
    transformation: {
      signatureBehavior: "Freezing on valid setups, then chasing",
      replacementBehavior: "Pre-committed execution at a small, fixed size",
      keystoneCommitment: "If the setup meets my criteria, I execute it.",
      dailyDiscordReport: "How many valid setups did I skip today, and why?",
    },
    fingerprint: { fear: -3, impulsiveness: 1, accountability: -1, consistency: -1 },
  },

  perfectionist: {
    id: "perfectionist",
    name: "The Perfectionist",
    tagline: "If it isn't flawless, you treat it as a failure.",
    description:
      "You hold yourself to an impossible standard. One rule-break, one imperfect exit, and the whole day is 'ruined' — so you over-tinker your system or quit setups that don't look textbook. Your standards are a strength turned against you: you punish good-enough execution and starve yourself of the consistency that compounds.",
    strengths: ["Your attention to process is genuinely high.", "You care about doing things right.", "You're capable of real discipline once you accept imperfection."],
    blindSpots: ["All-or-nothing thinking: one mistake voids the day.", "Endless system-tweaking instead of repetition.", "You conflate a clean chart with a valid trade."],
    commonMistakes: ["Abandoning a working system after a normal losing streak.", "Refusing 'B+' setups while waiting for perfect.", "Spiraling after a single rule-break."],
    emotionalTriggers: ["A small, avoidable mistake", "A losing streak inside a sound system", "Setups that are valid but not pretty"],
    recommendations: [
      "Measure adherence, not perfection. A 90% day is excellent.",
      "Freeze your system for a fixed sample before changing anything.",
    ],
    accountabilityWeaknesses: [
      "You over-report tiny imperfections and miss the bigger pattern.",
      "Shame after a mistake makes you withdraw from the room.",
    ],
    rootCauses: ["Self-worth fused to flawless performance.", "Intolerance of normal variance."],
    selfSabotageLoop: [
      "Make one small, avoidable mistake",
      "Declare the day 'ruined'",
      "Abandon the process out of frustration",
      "Trade carelessly or quit entirely",
      "Tinker with the system that was fine",
      "Restart the cycle from a worse place",
    ],
    nafsRoots: ["ego", "attachment"],
    recommendedCommitments: [
      "I judge the day by rule-adherence %, not by perfection.",
      "No system changes for the next 20 trades.",
      "After a mistake, I run a 60-second reset instead of quitting.",
    ],
    monitorBehaviors: ["Reaction to mistakes", "System changes mid-week"],
    transformation: {
      signatureBehavior: "Abandoning the process after one imperfection",
      replacementBehavior: "Measuring adherence and resetting after mistakes",
      keystoneCommitment: "One mistake does not void my day — I keep my process.",
      dailyDiscordReport: "What was my adherence % today? How did I respond to my first mistake?",
    },
    fingerprint: { consistency: -2, ego: -2, emotionalRegulation: -1, patience: -1 },
  },

  overconfident: {
    id: "overconfident",
    name: "The Overconfident Trader",
    tagline: "Your edge is real — until success makes the rules feel optional.",
    description:
      "When you're winning, you feel unstoppable — and that's exactly when the danger begins. Success loosens your discipline: size creeps up, rules feel like training wheels, and a hot streak becomes the setup for the drawdown that erases it. Your confidence is earned, but unchecked it becomes the leak.",
    strengths: ["You act decisively and trust your read.", "You recover from setbacks without losing belief.", "Paired with humility, your self-belief is a serious edge."],
    blindSpots: ["You credit wins to skill and losses to luck.", "Discipline feels unnecessary right when it matters.", "Your biggest drawdowns follow your biggest streaks."],
    commonMistakes: ["Increasing size after wins without better setups.", "Skipping the checklist because you 'know' this one.", "Ignoring risk rules during a hot streak."],
    emotionalTriggers: ["Two or more wins in a row", "Public validation of a call", "Feeling 'in the zone'"],
    recommendations: [
      "Tie size strictly to rules, not results. A win earns no extra risk.",
      "Run your full checklist on streaks — especially when you feel you don't need to.",
    ],
    accountabilityWeaknesses: [
      "You report streaks, not the discipline drift inside them.",
      "You resist feedback most when winning.",
    ],
    rootCauses: ["Ego inflation during success.", "Attributing outcomes to skill, ignoring variance."],
    selfSabotageLoop: [
      "Win two or more in a row",
      "Feel untouchable",
      "Loosen the rules and size up",
      "Take a setup you'd normally skip",
      "Give back the streak in one drawdown",
      "Blame luck and repeat",
    ],
    nafsRoots: ["ego", "overconfidence", "greed"],
    recommendedCommitments: [
      "Size stays fixed to rules, even on a streak.",
      "Full checklist on every trade, especially after wins.",
      "I report my discipline most closely when I'm winning.",
    ],
    monitorBehaviors: ["Size after wins", "Checklist skips on streaks"],
    transformation: {
      signatureBehavior: "Loosening discipline during winning streaks",
      replacementBehavior: "Tightest discipline exactly when you feel invincible",
      keystoneCommitment: "A win never earns me more risk.",
      dailyDiscordReport: "Did my discipline hold up on my wins today, or did size creep in?",
    },
    fingerprint: { ego: -3, risk: -2, discipline: -1, accountability: -1 },
  },

  validationSeeker: {
    id: "validationSeeker",
    name: "The Validation Seeker",
    tagline: "You trade for the audience, not the account.",
    description:
      "Somewhere along the way, trading became about being seen — proving you were right, sharing the win, belonging to the room. You take trades to have something to post, you let others' opinions move your hand, and your decisions quietly optimise for approval instead of process. The market doesn't care who's watching, but part of you always does.",
    strengths: ["You're collaborative and open to learning.", "You communicate and reflect well when pointed inward.", "Your desire for connection can power real accountability."],
    blindSpots: ["External approval matters more than your rules.", "You take trades for the story, not the setup.", "Others' opinions override your plan mid-trade."],
    commonMistakes: ["Entering to have something to share.", "Holding losers to avoid admitting a public call was wrong.", "Following others into setups you don't understand."],
    emotionalTriggers: ["A public prediction or shared position", "Others doubting your call", "The pull of the crowd's consensus"],
    recommendations: [
      "Trade in private for a defined period — let the account be the judge.",
      "Before sharing a position, ask: would I take this if no one ever saw it?",
    ],
    accountabilityWeaknesses: [
      "You perform accountability instead of practising it.",
      "You curate what you report for approval.",
    ],
    rootCauses: ["Self-worth sourced from external validation.", "Belonging tied to being right publicly."],
    selfSabotageLoop: [
      "Want to be seen winning",
      "Take a trade worth posting",
      "Tie your ego to the public call",
      "Hold the loser to avoid being wrong out loud",
      "Take a bigger loss than your plan allowed",
      "Seek reassurance and repeat",
    ],
    nafsRoots: ["validationSeeking", "ego"],
    recommendedCommitments: [
      "I take no trade for the sake of posting it.",
      "I report honestly, including the trades that look bad.",
      "I size and exit by my plan, not by who's watching.",
    ],
    monitorBehaviors: ["Trades tied to public calls", "Losers held to save face"],
    transformation: {
      signatureBehavior: "Trading for approval instead of process",
      replacementBehavior: "Private, process-first execution and honest reporting",
      keystoneCommitment: "I would take this trade if no one was watching.",
      dailyDiscordReport: "Did I trade for the setup today, or for the audience?",
    },
    fingerprint: { ego: -2, accountability: -2, consistency: -1, discipline: -1 },
  },

  ruleBreaker: {
    id: "ruleBreaker",
    name: "The Rule Breaker",
    tagline: "You make good rules — and then negotiate with them.",
    description:
      "You don't lack a plan. You lack obedience to it. In the moment, your rules become suggestions: a stop you move, a limit you stretch, a 'just this once' that becomes most days. You're independent and resourceful, but that same independence rebels against the structure that would set you free. The fight isn't with the market — it's with your own word.",
    strengths: ["You're adaptable and think for yourself.", "You can build sound, personal systems.", "Aimed at keeping your word, your independence becomes power."],
    blindSpots: ["Rules feel like constraints to negotiate, not commitments to honor.", "You rationalise breaks convincingly in the moment.", "Your relationship with your own word is the real battleground."],
    commonMistakes: ["Moving stops to avoid being stopped out.", "Exceeding position or daily limits 'just this once.'", "Overriding your plan whenever it's inconvenient."],
    emotionalTriggers: ["A rule about to cost you", "Feeling boxed in by your system", "The urge to make an exception"],
    recommendations: [
      "Make rules physically harder to break — hard stops, locked limits.",
      "Reframe rules as promises to yourself; breaking one breaks your word.",
    ],
    accountabilityWeaknesses: [
      "You report the plan, not the deviations from it.",
      "You treat broken rules as one-offs rather than the pattern.",
    ],
    rootCauses: ["A reflex against constraint, even self-imposed.", "In-the-moment rationalisation overriding pre-commitment."],
    selfSabotageLoop: [
      "Set a clear rule",
      "Hit the moment the rule would cost you",
      "Negotiate an exception, 'just this once'",
      "Break the rule and avoid the small loss",
      "Get rewarded occasionally, reinforcing the break",
      "Erode trust in your own word",
    ],
    nafsRoots: ["ego", "laziness"],
    recommendedCommitments: [
      "Hard stops only — I cannot move them.",
      "I report every rule I broke, not just my plan.",
      "One locked daily loss limit I physically cannot exceed.",
    ],
    monitorBehaviors: ["Stops moved", "Limits exceeded"],
    transformation: {
      signatureBehavior: "Negotiating with your own rules in the moment",
      replacementBehavior: "Treating rules as unbreakable promises to yourself",
      keystoneCommitment: "My stops and limits are not negotiable.",
      dailyDiscordReport: "Which rules did I honor, and which did I negotiate with today?",
    },
    fingerprint: { discipline: -3, accountability: -2, consistency: -1, impulsiveness: -1 },
  },
};

export const ARCHETYPE_LIST: Archetype[] = Object.values(ARCHETYPES);
