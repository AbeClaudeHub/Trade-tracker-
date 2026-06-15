import type { AssessmentQuestion } from "@/domain/types";

/**
 * The Trader Identity Assessment.
 *
 * 54 Likert items across nine behavioral dimensions (6 per dimension).
 * Items are written about *behavior under live conditions*, not knowledge.
 *
 * `reverse: true` means agreement signals UNHEALTHY behavior and the score
 * is inverted during scoring, so a high dimension score always means a
 * healthier behavioral profile.
 */
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ── Discipline ──────────────────────────────────────────────────────────
  { id: "dis1", dimension: "discipline", weight: 3, reverse: false, prompt: "I follow my trading plan even when the market tempts me to deviate." },
  { id: "dis2", dimension: "discipline", weight: 2, reverse: true, prompt: "I take trades that are not in my plan when something 'looks good'." },
  { id: "dis3", dimension: "discipline", weight: 2, reverse: false, prompt: "I have a written set of rules and I can recall them without looking." },
  { id: "dis4", dimension: "discipline", weight: 3, reverse: true, prompt: "Once I'm in front of the screen, my routine tends to fall apart." },
  { id: "dis5", dimension: "discipline", weight: 2, reverse: false, prompt: "I stop trading for the day once I hit my pre-defined limits." },
  { id: "dis6", dimension: "discipline", weight: 1, reverse: true, prompt: "I often tell myself 'just this once' and break a rule." },

  // ── Patience ────────────────────────────────────────────────────────────
  { id: "pat1", dimension: "patience", weight: 3, reverse: false, prompt: "I can sit through hours of no setups without forcing a trade." },
  { id: "pat2", dimension: "patience", weight: 2, reverse: true, prompt: "Waiting for confirmation feels unbearable, so I enter early." },
  { id: "pat3", dimension: "patience", weight: 2, reverse: false, prompt: "I am comfortable missing a move rather than chasing it." },
  { id: "pat4", dimension: "patience", weight: 3, reverse: true, prompt: "I feel I must be in a position to feel like I'm 'working'." },
  { id: "pat5", dimension: "patience", weight: 2, reverse: false, prompt: "I let trades develop instead of micromanaging every tick." },
  { id: "pat6", dimension: "patience", weight: 1, reverse: true, prompt: "Boredom is a common reason I open a position." },

  // ── Risk behavior ───────────────────────────────────────────────────────
  { id: "rsk1", dimension: "risk", weight: 3, reverse: false, prompt: "I size every position according to a fixed risk amount." },
  { id: "rsk2", dimension: "risk", weight: 3, reverse: true, prompt: "I increase my size dramatically when I feel 'sure' about a trade." },
  { id: "rsk3", dimension: "risk", weight: 2, reverse: false, prompt: "I always know my maximum loss before I enter." },
  { id: "rsk4", dimension: "risk", weight: 2, reverse: true, prompt: "I add to losing positions hoping they turn around." },
  { id: "rsk5", dimension: "risk", weight: 2, reverse: true, prompt: "After a win, I risk far more on the next trade." },
  { id: "rsk6", dimension: "risk", weight: 1, reverse: false, prompt: "My risk per trade stays consistent regardless of recent results." },

  // ── Ego ─────────────────────────────────────────────────────────────────
  { id: "ego1", dimension: "ego", weight: 3, reverse: true, prompt: "I find it hard to admit a trade was simply wrong." },
  { id: "ego2", dimension: "ego", weight: 2, reverse: true, prompt: "I need the market to prove me right before I'll exit a loser." },
  { id: "ego3", dimension: "ego", weight: 2, reverse: false, prompt: "I can take a loss without it bruising my sense of self." },
  { id: "ego4", dimension: "ego", weight: 3, reverse: true, prompt: "Being right matters more to me than executing my process." },
  { id: "ego5", dimension: "ego", weight: 2, reverse: true, prompt: "I hold trades to avoid the feeling of being defeated." },
  { id: "ego6", dimension: "ego", weight: 1, reverse: false, prompt: "I separate my identity from the outcome of any single trade." },

  // ── Fear ────────────────────────────────────────────────────────────────
  { id: "fea1", dimension: "fear", weight: 3, reverse: true, prompt: "I close winners too early because I'm afraid of giving profit back." },
  { id: "fea2", dimension: "fear", weight: 2, reverse: true, prompt: "Fear of missing out pushes me into trades I'd otherwise skip." },
  { id: "fea3", dimension: "fear", weight: 2, reverse: true, prompt: "I hesitate to take valid setups after a string of losses." },
  { id: "fea4", dimension: "fear", weight: 3, reverse: false, prompt: "I can execute a valid setup even when I feel afraid." },
  { id: "fea5", dimension: "fear", weight: 2, reverse: true, prompt: "I move my stop further away because I'm scared of being stopped out." },
  { id: "fea6", dimension: "fear", weight: 1, reverse: false, prompt: "Fear rarely changes the way I manage an open position." },

  // ── Impulsiveness ───────────────────────────────────────────────────────
  { id: "imp1", dimension: "impulsiveness", weight: 3, reverse: true, prompt: "I enter trades on a sudden urge before fully checking my criteria." },
  { id: "imp2", dimension: "impulsiveness", weight: 2, reverse: true, prompt: "I react to fast price moves before thinking them through." },
  { id: "imp3", dimension: "impulsiveness", weight: 2, reverse: false, prompt: "I pause and breathe before clicking the button." },
  { id: "imp4", dimension: "impulsiveness", weight: 3, reverse: true, prompt: "I 'click first, justify later' more often than I'd like." },
  { id: "imp5", dimension: "impulsiveness", weight: 2, reverse: true, prompt: "Notifications or news headlines often trigger spontaneous trades." },
  { id: "imp6", dimension: "impulsiveness", weight: 1, reverse: false, prompt: "There is always a deliberate gap between my impulse and my action." },

  // ── Consistency ─────────────────────────────────────────────────────────
  { id: "con1", dimension: "consistency", weight: 3, reverse: false, prompt: "My process looks the same on a good day and a bad day." },
  { id: "con2", dimension: "consistency", weight: 2, reverse: true, prompt: "My approach changes drastically depending on my mood." },
  { id: "con3", dimension: "consistency", weight: 2, reverse: false, prompt: "I journal or review my trading on a regular schedule." },
  { id: "con4", dimension: "consistency", weight: 3, reverse: true, prompt: "I frequently abandon strategies before giving them a fair test." },
  { id: "con5", dimension: "consistency", weight: 2, reverse: false, prompt: "I show up and execute even when I don't feel motivated." },
  { id: "con6", dimension: "consistency", weight: 1, reverse: true, prompt: "I chase whatever strategy worked most recently for others." },

  // ── Accountability ──────────────────────────────────────────────────────
  { id: "acc1", dimension: "accountability", weight: 3, reverse: false, prompt: "When a trade goes wrong, I look first at my own decisions." },
  { id: "acc2", dimension: "accountability", weight: 2, reverse: true, prompt: "I blame the market, news, or 'manipulation' for my losses." },
  { id: "acc3", dimension: "accountability", weight: 2, reverse: false, prompt: "I record my mistakes honestly, even the embarrassing ones." },
  { id: "acc4", dimension: "accountability", weight: 3, reverse: true, prompt: "I avoid reviewing my losing trades because it feels uncomfortable." },
  { id: "acc5", dimension: "accountability", weight: 2, reverse: false, prompt: "I would be comfortable showing my behavior log to someone I trust." },
  { id: "acc6", dimension: "accountability", weight: 1, reverse: true, prompt: "I tend to hide or minimise my worst trading days." },

  // ── Emotional regulation ────────────────────────────────────────────────
  { id: "emo1", dimension: "emotionalRegulation", weight: 3, reverse: true, prompt: "A big loss can ruin the rest of my trading day." },
  { id: "emo2", dimension: "emotionalRegulation", weight: 2, reverse: true, prompt: "I trade to get back to even after a painful loss." },
  { id: "emo3", dimension: "emotionalRegulation", weight: 2, reverse: false, prompt: "I can step away from the screen when I feel emotionally charged." },
  { id: "emo4", dimension: "emotionalRegulation", weight: 3, reverse: true, prompt: "Excitement after a win often leads me to overtrade." },
  { id: "emo5", dimension: "emotionalRegulation", weight: 2, reverse: false, prompt: "I notice my emotional state before it drives my decisions." },
  { id: "emo6", dimension: "emotionalRegulation", weight: 1, reverse: true, prompt: "My emotions swing sharply with each trade's outcome." },
];

export const LIKERT_LABELS: Record<number, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};

export const ASSESSMENT_LENGTH = ASSESSMENT_QUESTIONS.length;
