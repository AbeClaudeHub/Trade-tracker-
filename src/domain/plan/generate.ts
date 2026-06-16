import type { Archetype, ArchetypeTransformation, DayMission } from "@/domain/types";

/**
 * Generate a concrete, 30-day, day-by-day plan tailored to the archetype.
 * Four phases (Awareness → Interruption → Replacement → Consolidation), each
 * with a pool of specific daily missions parameterised by the trader's
 * signature behavior, replacement behavior, and keystone commitment.
 */
type Mission = (t: ArchetypeTransformation) => { title: string; action: string; discordPrompt: string };

interface Phase {
  theme: string;
  days: number;
  missions: Mission[];
}

const PHASES: Phase[] = [
  {
    theme: "Awareness",
    days: 7,
    missions: [
      (t) => ({ title: "Name the pattern", action: `Before the session, write one sentence: "Today I might ${t.signatureBehavior.toLowerCase()}." Just notice it.`, discordPrompt: t.dailyDiscordReport }),
      (t) => ({ title: "Track the urge", action: `Every time the urge to ${t.signatureBehavior.toLowerCase()} appears, make a tally. Don't fight it — count it.`, discordPrompt: "How many times did the urge show up today?" }),
      (t) => ({ title: "Find the trigger", action: "Identify the exact moment or feeling that precedes your worst behavior. Write it down.", discordPrompt: "What triggered the urge most today?" }),
      (t) => ({ title: "Pre-commit", action: `State your keystone before the open: "${t.keystoneCommitment}"`, discordPrompt: "Did stating my commitment out loud change anything?" }),
      () => ({ title: "Rate your emotion", action: "Log your emotional state (1–5) at the open and at the close. Notice the gap.", discordPrompt: "Open vs close emotional state — what shifted?" }),
      () => ({ title: "Review the tape", action: "Look back at one trade you regret this week. What was the feeling, not the chart?", discordPrompt: "What was the emotion behind my worst trade this week?" }),
      (t) => ({ title: "Awareness check", action: `Honestly: how often did you ${t.signatureBehavior.toLowerCase()} this week? No judgement — just the number.`, discordPrompt: "My week-1 honesty score on my signature behavior." }),
    ],
  },
  {
    theme: "Interruption",
    days: 8,
    missions: [
      () => ({ title: "The pause", action: "When the urge hits, stop and take three slow breaths before any action.", discordPrompt: "Did I pause before acting today?" }),
      (t) => ({ title: "If-this-then-that", action: `Pre-decide your response: when you feel the urge, you will ${t.replacementBehavior.toLowerCase()} instead.`, discordPrompt: "Did my pre-decided response hold?" }),
      (t) => ({ title: "Honor the keystone", action: `Make today only about one thing: "${t.keystoneCommitment}" Nothing else matters.`, discordPrompt: "Did I keep my keystone commitment today?" }),
      () => ({ title: "Walk it off", action: "After your first loss or strong emotion, step away from the screen for 10 minutes.", discordPrompt: "Did I step away when I felt charged?" }),
      () => ({ title: "One trade rule", action: "Limit yourself to your highest-conviction setup only. Quality over quantity.", discordPrompt: "Did I trade only my A-setup today?" }),
      () => ({ title: "Interrupt out loud", action: "Say the interruption out loud when the urge appears: 'Not this one.'", discordPrompt: "How did saying it out loud feel?" }),
      () => ({ title: "Mid-session reset", action: "Schedule one deliberate pause halfway through your session to re-read your commitment.", discordPrompt: "Did the mid-session reset help?" }),
      () => ({ title: "Interruption tally", action: "Count how many times you successfully interrupted the pattern this week.", discordPrompt: "My week-2 interruption count." }),
    ],
  },
  {
    theme: "Replacement",
    days: 8,
    missions: [
      (t) => ({ title: "Install the replacement", action: `Make ${t.replacementBehavior.toLowerCase()} your default. Practise it on every relevant moment today.`, discordPrompt: `Did ${t.replacementBehavior.toLowerCase()} hold today?` }),
      () => ({ title: "Reward the discipline", action: "When you choose the disciplined path, acknowledge it. Note it as a win, even if you missed a move.", discordPrompt: "What disciplined choice am I proud of today?" }),
      (t) => ({ title: "Raise the standard", action: `Hold your keystone even when it costs you: "${t.keystoneCommitment}"`, discordPrompt: "Did my keystone cost me anything today — and did I hold it?" }),
      () => ({ title: "Clean execution", action: "Aim for a 'process-perfect' session: every action by the book, regardless of outcome.", discordPrompt: "Was today process-perfect? What slipped?" }),
      () => ({ title: "Teach it", action: "Explain your replacement behavior to your room as if coaching someone else with your pattern.", discordPrompt: "Shared my approach with the room — what came back?" }),
      () => ({ title: "Handle the test", action: "Markets will test you today. Treat the hardest moment as the rep that matters most.", discordPrompt: "What was today's hardest test, and how did I handle it?" }),
      () => ({ title: "Consistency over intensity", action: "Show up and execute the same way you did yesterday. Boring is the goal.", discordPrompt: "Did I keep it boring and consistent?" }),
      () => ({ title: "Replacement check", action: "How natural does the new behavior feel now versus week 1?", discordPrompt: "My week-3 reflection: how much has the default shifted?" }),
    ],
  },
  {
    theme: "Consolidation",
    days: 7,
    missions: [
      () => ({ title: "Autopilot", action: "Execute your process without internal debate. Trust the reps you've put in.", discordPrompt: "Did discipline feel automatic today?" }),
      (t) => ({ title: "Identity statement", action: `Write it as identity, not effort: "I am a trader who ${t.replacementBehavior.toLowerCase()}."`, discordPrompt: "My identity statement for the next 30 days." }),
      () => ({ title: "Stress test", action: "On a hard day, prove the change is real. The streak doesn't break here.", discordPrompt: "Today tested me — did the new identity hold?" }),
      () => ({ title: "Mentor a peer", action: "Help someone in your room with the pattern you've been beating. Teaching cements it.", discordPrompt: "Who did I help in the room today?" }),
      () => ({ title: "Measure the change", action: "Compare this week to week 1. Name one concrete improvement in your behavior.", discordPrompt: "One measurable way I've changed in 30 days." }),
      () => ({ title: "Set the next keystone", action: "Choose the one commitment that carries you into the next 30 days.", discordPrompt: "My keystone commitment for the next month." }),
      () => ({ title: "Graduate", action: "Reassess your archetype and see how far you've moved from where you started.", discordPrompt: "I finished 30 days. Here's what changed." }),
    ],
  },
];

export function generateDayPlan(archetype: Archetype): DayMission[] {
  const missions: DayMission[] = [];
  let day = 1;
  PHASES.forEach((phase, phaseIndex) => {
    for (let i = 0; i < phase.days; i++) {
      const m = phase.missions[i % phase.missions.length]!(archetype.transformation);
      missions.push({ day, week: phaseIndex + 1, theme: phase.theme, ...m });
      day += 1;
    }
  });
  return missions;
}
