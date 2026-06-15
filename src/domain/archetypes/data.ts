import type { Archetype, ArchetypeId } from "@/domain/types";

/**
 * The eight initial trader archetypes.
 *
 * Each archetype is a *behavioral* identity, not a strategy. The `fingerprint`
 * maps a low score on a dimension to a pull toward this archetype (the more
 * negative, the stronger the pull when that dimension is weak).
 *
 * Reports are written to feel personal and honest — naming the pattern without
 * shaming the person.
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
      "You act decisively when you commit.",
      "Your energy and appetite for opportunity are real assets once channeled.",
    ],
    blindSpots: [
      "You confuse motion with progress — being in a trade feels like winning.",
      "You enter after the edge has already been priced in.",
      "FOMO overrides your plan in the moments that matter most.",
    ],
    commonMistakes: [
      "Buying tops and selling bottoms after a move is already exhausted.",
      "Abandoning your entry criteria to 'get in before it's too late.'",
      "Stacking chase-trades after watching others post gains.",
    ],
    emotionalTriggers: [
      "Seeing a fast, vertical move",
      "Others posting wins you 'should' have caught",
      "The feeling of being left out",
    ],
    recommendations: [
      "Define the exact entry window. If price is past it, the trade is gone — and that is allowed.",
      "Keep a 'missed it on purpose' log. Reward yourself for the trades you didn't chase.",
      "Before any late entry, write one sentence: 'What is my edge here, right now?' If you can't, you don't have one.",
    ],
    fingerprint: { patience: -3, impulsiveness: -2, fear: -1, discipline: -1 },
  },

  gambler: {
    id: "gambler",
    name: "The Gambler",
    tagline: "The thrill is the point — and that's the problem.",
    description:
      "For you, the market is alive in a way it isn't for most people. The uncertainty is intoxicating. You size up when your conviction spikes, you take the trade for the rush as much as the reason, and the line between trading and gambling can quietly disappear. You are capable of real edge — but the part of you that craves the action keeps undoing the part of you that knows better.",
    strengths: [
      "You are comfortable with uncertainty that paralyses others.",
      "You can pull the trigger without endless hesitation.",
      "When disciplined, your tolerance for risk becomes genuine courage.",
    ],
    blindSpots: [
      "You size by feeling, not by formula.",
      "The dopamine of action matters more than the quality of the setup.",
      "You mistake variance for skill after a hot streak.",
    ],
    commonMistakes: [
      "Oversizing on 'sure things.'",
      "Trading for stimulation during dead markets.",
      "Letting a single conviction trade put real damage on the account.",
    ],
    emotionalTriggers: [
      "Boredom and flat markets",
      "A surge of certainty",
      "The desire to feel something",
    ],
    recommendations: [
      "Fix your risk per trade as a hard rule. Conviction does not change position size — ever.",
      "Separate 'I want action' from 'there is a setup.' Name which one you're feeling before entering.",
      "Schedule deliberate screen-off time so trading stops being your only source of stimulation.",
    ],
    fingerprint: { risk: -3, impulsiveness: -2, emotionalRegulation: -1, discipline: -1 },
  },

  avenger: {
    id: "avenger",
    name: "The Avenger",
    tagline: "You don't trade the market — you trade your last loss.",
    description:
      "When the market takes from you, you want it back, and you want it back now. Revenge trading is the signature pattern: a loss lands, the pain spikes, and the next trade is no longer a decision — it's a counterattack. You are loyal, intense, and you care deeply about winning. But the need to get even turns a single loss into a cascade.",
    strengths: [
      "You are tenacious and refuse to be beaten.",
      "You feel things deeply, which can fuel real commitment.",
      "Your competitiveness, once aimed inward at your process, is powerful.",
    ],
    blindSpots: [
      "A loss feels like a personal attack that must be answered.",
      "Your worst trades cluster immediately after your painful ones.",
      "You escalate size to 'make it back fast.'",
    ],
    commonMistakes: [
      "Re-entering immediately after a stop-out, on tilt.",
      "Doubling size to recover a loss in one trade.",
      "Trading well past your daily limit when you're down.",
    ],
    emotionalTriggers: [
      "A loss that felt unfair",
      "Being stopped out just before price reverses",
      "Ending the day red",
    ],
    recommendations: [
      "Install a mandatory cooldown after any loss beyond a threshold — step away, no exceptions.",
      "Set a hard daily loss limit that ends your session automatically.",
      "After a loss, write what you feel before you do anything. Name the urge to get even.",
    ],
    fingerprint: { emotionalRegulation: -3, risk: -2, ego: -1, discipline: -1 },
  },

  hesitator: {
    id: "hesitator",
    name: "The Hesitator",
    tagline: "You see the setup clearly — and freeze.",
    description:
      "You often know exactly what to do, and then watch yourself not do it. Fear of being wrong, of losing, of the discomfort of commitment keeps your finger off the trigger until the move is gone — at which point you chase it, completing the cruelest loop in trading. The irony is that your caution is a strength wearing the mask of a weakness.",
    strengths: [
      "You are thoughtful and rarely reckless.",
      "You respect risk instinctively.",
      "Your patience is real — it just tips into paralysis.",
    ],
    blindSpots: [
      "You treat a valid loss as a personal failure to be avoided at all costs.",
      "You demand certainty the market will never give.",
      "Your missed trades hurt more than your losing ones — but you don't log them.",
    ],
    commonMistakes: [
      "Skipping valid setups and chasing them later.",
      "Cutting winners early out of fear.",
      "Over-analysing until the opportunity passes.",
    ],
    emotionalTriggers: [
      "The moment of committing capital",
      "A recent loss",
      "Ambiguity in the setup",
    ],
    recommendations: [
      "Pre-commit: when criteria are met, you take it. Decide before, not during.",
      "Trade a defined small size while rebuilding trust in your execution.",
      "Log every missed valid setup as a 'cost.' Make inaction visible.",
    ],
    fingerprint: { fear: -3, impulsiveness: 1, accountability: -1, consistency: -1 },
  },

  perfectionist: {
    id: "perfectionist",
    name: "The Perfectionist",
    tagline: "If it isn't flawless, you treat it as a failure.",
    description:
      "You hold yourself to an impossible standard. One rule-break, one imperfect exit, and the whole day is 'ruined' — so you either over-tinker your system endlessly or quit setups that don't look textbook. Your standards are a strength turned against you: you punish good-enough execution and starve yourself of the consistency that actually compounds.",
    strengths: [
      "Your attention to detail and process is genuinely high.",
      "You care about doing things right.",
      "You're capable of real discipline once you accept imperfection.",
    ],
    blindSpots: [
      "All-or-nothing thinking: one mistake voids the whole session.",
      "Endless system-tweaking instead of repetition.",
      "You conflate a clean chart with a valid trade.",
    ],
    commonMistakes: [
      "Abandoning a working system after a normal losing streak.",
      "Refusing 'B+' setups while waiting for the perfect one.",
      "Spiraling after a single rule-break instead of resetting.",
    ],
    emotionalTriggers: [
      "A small, avoidable mistake",
      "A losing streak inside a sound system",
      "Setups that are valid but not pretty",
    ],
    recommendations: [
      "Measure adherence, not perfection. A 90% day is an excellent day.",
      "Freeze your system for a fixed sample size before changing anything.",
      "After a mistake, run a 60-second reset ritual instead of writing off the day.",
    ],
    fingerprint: { consistency: -2, ego: -2, emotionalRegulation: -1, patience: -1 },
  },

  overconfident: {
    id: "overconfident",
    name: "The Overconfident Trader",
    tagline: "Your edge is real — until success convinces you the rules are optional.",
    description:
      "When you're winning, you feel unstoppable — and that's exactly when the danger begins. Success loosens your discipline: size creeps up, rules feel like training wheels, and a hot streak becomes the setup for the drawdown that erases it. Your confidence is earned, but unchecked it stops being an asset and becomes the leak.",
    strengths: [
      "You act decisively and trust your read.",
      "You recover from setbacks without losing belief.",
      "Your self-belief, when paired with humility, is a serious edge.",
    ],
    blindSpots: [
      "You credit wins to skill and losses to bad luck.",
      "Discipline feels unnecessary right when it matters most.",
      "Your biggest drawdowns follow your biggest winning streaks.",
    ],
    commonMistakes: [
      "Increasing size after wins without any change in setup quality.",
      "Skipping your checklist because you 'know' this one.",
      "Ignoring risk rules during a hot streak.",
    ],
    emotionalTriggers: [
      "Two or more wins in a row",
      "Public validation of a call",
      "The feeling of being 'in the zone,'",
    ],
    recommendations: [
      "Tie size strictly to rules, not results. A win does not earn you more risk.",
      "Run your full checklist on streaks — especially when you feel you don't need to.",
      "Track your behavior most closely after wins, not after losses.",
    ],
    fingerprint: { ego: -3, risk: -2, discipline: -1, accountability: -1 },
  },

  validationSeeker: {
    id: "validationSeeker",
    name: "The Validation Seeker",
    tagline: "You trade for the audience, not the account.",
    description:
      "Somewhere along the way, trading became about being seen — proving you were right, sharing the win, belonging to the room. You take trades to have something to post, you let others' opinions move your hand, and your decisions quietly optimise for approval instead of process. The market doesn't care who's watching, but part of you always does.",
    strengths: [
      "You're collaborative and open to learning from others.",
      "You communicate and reflect well when pointed inward.",
      "Your desire for connection can power genuine accountability.",
    ],
    blindSpots: [
      "External approval matters more than your own rules.",
      "You take trades for the story, not the setup.",
      "Others' opinions override your plan mid-trade.",
    ],
    commonMistakes: [
      "Entering trades to have something to share.",
      "Holding losers to avoid admitting a public call was wrong.",
      "Following others into setups you don't actually understand.",
    ],
    emotionalTriggers: [
      "A public prediction or shared position",
      "Others doubting your call",
      "The pull of the crowd's consensus",
    ],
    recommendations: [
      "Trade in private for a defined period. Let the account, not the audience, be the judge.",
      "Before sharing a position, ask: would I take this if no one ever saw it?",
      "Choose one accountability partner over a crowd. Depth over applause.",
    ],
    fingerprint: { ego: -2, accountability: -2, consistency: -1, discipline: -1 },
  },

  ruleBreaker: {
    id: "ruleBreaker",
    name: "The Rule Breaker",
    tagline: "You make good rules — and then negotiate with them.",
    description:
      "You don't lack a plan. You lack obedience to it. In the moment, your rules become suggestions: a stop you move, a limit you stretch, a 'just this once' that becomes most days. You're independent and resourceful, but that same independence rebels against the very structure that would set you free. The fight isn't with the market — it's with your own agreements.",
    strengths: [
      "You're adaptable and think for yourself.",
      "You're capable of creating sound, personal systems.",
      "Your independence becomes power once aimed at keeping your word.",
    ],
    blindSpots: [
      "Rules feel like constraints to negotiate rather than commitments to honor.",
      "You rationalise breaks convincingly in the moment.",
      "Your relationship with your own word is the real battleground.",
    ],
    commonMistakes: [
      "Moving stops to avoid being stopped out.",
      "Exceeding position or daily limits 'just this once.'",
      "Overriding your plan whenever it's inconvenient.",
    ],
    emotionalTriggers: [
      "A rule that's about to cost you",
      "Feeling boxed in by your own system",
      "The urge to make an exception",
    ],
    recommendations: [
      "Make rules physically harder to break — hard stops, locked limits, automation.",
      "Track rule adherence as your single most important metric.",
      "Reframe rules as promises to yourself. Breaking one is breaking your word, not beating the market.",
    ],
    fingerprint: { discipline: -3, accountability: -2, consistency: -1, impulsiveness: -1 },
  },
};

export const ARCHETYPE_LIST: Archetype[] = Object.values(ARCHETYPES);
