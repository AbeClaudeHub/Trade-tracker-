import type { ArchetypeId, PlaybookEntry } from "@/domain/types";

interface ArchetypePlay {
  /** Trigger → pre-decided response. The trader's "emotional firewall." */
  playbook: PlaybookEntry[];
  /** A short personal rulebook the trader can adopt and post in their room. */
  rulebook: string[];
}

/**
 * Practical, high-value assets per archetype: an if-this-then-that firewall and
 * a personal rulebook. Kept separate from the archetype's diagnostic content so
 * each stays focused and easy to edit.
 */
export const PLAYBOOKS: Record<ArchetypeId, ArchetypePlay> = {
  chaser: {
    playbook: [
      { trigger: "Price runs and you missed the clean entry", response: "Say out loud: 'It's gone.' Journal the missed move instead of entering." },
      { trigger: "You feel the urge to 'just get in'", response: "Set a 60-second timer. If the setup isn't valid when it ends, you skip it." },
      { trigger: "Someone posts a win you missed", response: "Mute the channel for 15 minutes. Their trade is not your setup." },
    ],
    rulebook: [
      "I only enter inside my pre-defined window.",
      "A missed move is a non-event, not a loss.",
      "Maximum 2 trades per session.",
      "Every entry passes my checklist before I click.",
    ],
  },
  gambler: {
    playbook: [
      { trigger: "Conviction spikes and you want to size up", response: "Size stays fixed. Conviction is a feeling, not a position-sizing input." },
      { trigger: "The market is flat and you're bored", response: "Close the platform for 20 minutes. Boredom is not a setup." },
      { trigger: "You feel the rush before a trade", response: "Name it: 'This is the rush, not the read.' Re-check your criteria." },
    ],
    rulebook: [
      "My risk per trade is fixed, always.",
      "I never trade out of boredom.",
      "I log the feeling behind every entry.",
      "No 'all-in' conviction trades — ever.",
    ],
  },
  avenger: {
    playbook: [
      { trigger: "You just took a painful loss", response: "Step away from the screen for 15 minutes. No re-entry on tilt." },
      { trigger: "You want to 'make it back' this session", response: "Remind yourself: the next trade is not a counterattack. Wait for a real setup." },
      { trigger: "You hit your daily loss limit", response: "Session over. Close everything. Tomorrow is a new day." },
    ],
    rulebook: [
      "After any loss beyond my threshold, I step away before acting.",
      "I have a hard daily loss limit that ends my session.",
      "No re-entry within 10 minutes of a loss.",
      "I never double size to recover.",
    ],
  },
  hesitator: {
    playbook: [
      { trigger: "Your setup criteria are met", response: "Take it. The decision was made before the candle — execute now." },
      { trigger: "You feel the fear of being wrong", response: "Trade your defined small size. A valid loss is the cost of doing business." },
      { trigger: "You skipped a valid setup", response: "Log it as a cost. Missed trades are mistakes too." },
    ],
    rulebook: [
      "If the setup meets my criteria, I execute — no extra confirmation.",
      "I trade a defined small size while rebuilding trust.",
      "I log every valid setup I skip.",
      "I do not move my target out of fear.",
    ],
  },
  perfectionist: {
    playbook: [
      { trigger: "You make one small mistake", response: "Run a 60-second reset. One error does not void the day." },
      { trigger: "A valid 'B+' setup appears", response: "Take it. Waiting only for perfect starves your consistency." },
      { trigger: "You want to change your system after a losing streak", response: "Freeze it. No changes until the agreed sample size is complete." },
    ],
    rulebook: [
      "I judge my day by adherence %, not perfection.",
      "No system changes for the next 20 trades.",
      "After a mistake, I reset — I don't write off the day.",
      "Good-enough execution, repeated, beats perfect execution, rare.",
    ],
  },
  overconfident: {
    playbook: [
      { trigger: "You've won two or more in a row", response: "Tighten, don't loosen. Run the full checklist — especially now." },
      { trigger: "You feel 'in the zone' and want to size up", response: "A win earns no extra risk. Size stays tied to the rules." },
      { trigger: "You want to skip your checklist", response: "Slow down. The trades you 'know' are where the leak lives." },
    ],
    rulebook: [
      "A win never earns me more risk.",
      "I run my full checklist on every trade, especially on streaks.",
      "I track my discipline most closely when I'm winning.",
      "Confidence is earned each session, not carried over.",
    ],
  },
  validationSeeker: {
    playbook: [
      { trigger: "You want to post a trade", response: "Ask: would I take this if no one ever saw it? If no, skip it." },
      { trigger: "Someone doubts your public call", response: "Manage the trade by your plan, not by the audience's opinion." },
      { trigger: "You're holding a loser you called publicly", response: "Exit by your stop. Being wrong privately beats being broke publicly." },
    ],
    rulebook: [
      "I take no trade for the sake of posting it.",
      "I size and exit by my plan, not by who's watching.",
      "I report honestly — including the trades that look bad.",
      "My account is the judge, not my audience.",
    ],
  },
  ruleBreaker: {
    playbook: [
      { trigger: "A rule is about to cost you", response: "Honor it anyway. The cost of the rule is smaller than the cost of breaking your word." },
      { trigger: "You want to make an exception 'just this once'", response: "There are no exceptions. Write down what you almost did instead." },
      { trigger: "You feel boxed in by your system", response: "Remember you chose these rules to set yourself free. Keep your promise." },
    ],
    rulebook: [
      "My stops and limits are not negotiable.",
      "I report every rule I break, not just my plan.",
      "One locked daily loss limit I physically cannot exceed.",
      "Breaking a rule is breaking my word to myself.",
    ],
  },
};
