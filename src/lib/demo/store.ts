/**
 * Seeded in-memory store powering demo mode. Generates ~45 days of realistic,
 * *improving* behavioral history so every screen — dashboard, patterns, nafs,
 * rooms, identity — has believable data. All writes mutate this store so the
 * user can commit/review live within the demo.
 */
import {
  type AssessmentResult,
  type BehaviorActionId,
  type BoardRow,
  type Commitment,
  type DailyEntry,
  type Intervention,
  type NafsCategory,
  type NafsIncident,
  type Room,
  type RoomFeedEvent,
  type RoomMember,
  type UserProfile,
  type WeeklyReflection,
} from "@/domain/types";
import { BEHAVIOR_ACTIONS } from "@/domain/behavior/actions";
import { computeDayScore, hasViolation, honoredRate } from "@/domain/behavior/scoring";
import { scoreAssessment } from "@/domain/assessment/scoring";
import { COMMITMENT_TEMPLATES } from "@/domain/commitments/catalog";
import { daysAgoKey, todayKey, weekId, weekStartKey } from "@/lib/dates";

const DEMO_UID = "demo-sam";
const ROOM_ID = "demo-room";

// Deterministic PRNG so the demo is stable across reloads.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface DemoData {
  profile: UserProfile;
  assessment: AssessmentResult;
  dailies: Map<string, DailyEntry>;
  incidents: NafsIncident[];
  reflections: WeeklyReflection[];
  interventions: Intervention[];
  room: Room;
  members: RoomMember[];
  board: Map<string, BoardRow>; // key: `${date}:${uid}`
  feed: RoomFeedEvent[];
}

let DATA: DemoData | null = null;

function buildDaily(
  date: string,
  templateIds: string[],
  brokenIds: string[],
  actions: BehaviorActionId[],
  emotion: 1 | 2 | 3 | 4 | 5,
): DailyEntry {
  const commitments: Commitment[] = templateIds.map((id) => {
    const t = COMMITMENT_TEMPLATES.find((x) => x.id === id)!;
    return {
      id,
      templateId: id,
      text: t.label,
      mappedViolation: t.mappedViolation,
      nafsTags: t.nafsHints,
      status: brokenIds.includes(id) ? "broken" : "honored",
    };
  });
  return {
    id: date,
    userId: DEMO_UID,
    date,
    createdAt: date + "T08:00:00.000Z",
    committedAt: date + "T08:00:00.000Z",
    reviewedAt: date + "T21:00:00.000Z",
    commitments,
    preMarket: {
      feeling: emotion >= 4 ? "Restless, a bit charged." : "Calm and ready.",
      plan: "Trade my A-setups only.",
      sabotageRisk: emotion >= 4 ? "Chasing if I miss the first move." : "Boredom.",
      emotionalState: emotion,
    },
    postMarket: {
      followedRules: actions.every((a) => !BEHAVIOR_ACTIONS[a]?.isViolation),
      violatedRisk: actions.includes("brokeRiskRules"),
      emotionsAffectedDecisions: emotion >= 4 && hasViolation(actions),
      learned: "Noticed the urge before acting — mostly.",
    },
    actions,
    dayScore: computeDayScore(commitments, actions, true),
    honoredRate: honoredRate(commitments),
    hadViolation: hasViolation(actions),
  };
}

function seed(): DemoData {
  const rand = mulberry32(20260615);
  const dailies = new Map<string, DailyEntry>();
  const incidents: NafsIncident[] = [];
  let incId = 0;

  const TEMPLATES = ["no_chasing_entries", "max_trades", "respect_stop_loss"];
  const VIOLATION_POOL: BehaviorActionId[] = [
    "chasedEntries",
    "overtraded",
    "movedStop",
    "revengeTraded",
  ];

  for (let i = 45; i >= 0; i--) {
    const date = daysAgoKey(i);
    const dow = new Date(date + "T00:00:00").getDay();
    if (dow === 0 || dow === 6) continue; // weekends off → realistic gaps
    if (i !== 0 && rand() < 0.12) continue; // occasional missed day

    const progress = (45 - i) / 45; // 0 early → 1 recent (improving)
    const violationChance = 0.7 * (1 - progress) + 0.08; // ~0.78 → ~0.08
    const emotion = (Math.min(5, Math.max(1, Math.round(4 - progress * 2 + (rand() - 0.5)))) as 1 | 2 | 3 | 4 | 5);

    const actions: BehaviorActionId[] = ["followedPlan", "waitedForSetup", "completedReflection"];
    const broken: string[] = [];

    if (rand() < violationChance) {
      const v = VIOLATION_POOL[Math.floor(rand() * (1 + Math.floor(progress * 1)) ) ] ?? "chasedEntries";
      actions.push(v);
      // Map violation back to a broken commitment when relevant.
      const tmpl = TEMPLATES.find((t) => COMMITMENT_TEMPLATES.find((x) => x.id === t)?.mappedViolation === v);
      if (tmpl) broken.push(tmpl);
      // remove a contradicting affirmation
      if (v === "chasedEntries") {
        const idx = actions.indexOf("waitedForSetup");
        if (idx >= 0) actions.splice(idx, 1);
      }
      // nafs incident
      const hints = BEHAVIOR_ACTIONS[v]?.nafsHints ?? ["impatience"];
      incidents.push({
        id: `demo-inc-${incId++}`,
        userId: DEMO_UID,
        date,
        categories: [hints[0] as NafsCategory],
        sourceType: "violation",
        sourceRef: v,
        createdAt: date + "T21:00:00.000Z",
      });
    } else {
      actions.push("honoredStop", "respectedMaxLoss");
    }

    dailies.set(date, buildDaily(date, TEMPLATES, broken, actions, emotion));
  }

  const dimensionScores = scoreAssessment({});
  // Nudge the baseline toward a "Chaser": weak patience/impulsiveness.
  dimensionScores.patience = 32;
  dimensionScores.impulsiveness = 38;
  dimensionScores.discipline = 45;

  const assessment: AssessmentResult = {
    id: "demo-assessment",
    userId: DEMO_UID,
    completedAt: daysAgoKey(46) + "T10:00:00.000Z",
    responses: {},
    dimensionScores,
    archetypeId: "chaser",
    secondaryArchetypeId: "gambler",
    interpretation:
      "You started as The Chaser. Your patience and impulse control are your weakest links — when price runs, something in you refuses to be left behind. The work ahead is learning to let moves go.",
  };

  const profile: UserProfile = {
    uid: DEMO_UID,
    email: "demo@niyyah.os",
    displayName: "Sam (Demo)",
    createdAt: daysAgoKey(46) + "T10:00:00.000Z",
    tz: "UTC",
    assessmentCompleted: true,
    archetypeId: "chaser",
    baselineArchetypeId: "chaser",
    roomIds: [ROOM_ID],
  };

  const room: Room = {
    id: ROOM_ID,
    name: "Dawn Patrol",
    ownerId: "demo-amina",
    inviteCode: "DEMO01",
    memberCount: 6,
    cutoffLocalTime: "17:00",
    tzAnchor: "UTC",
    encouragedTemplates: ["no_chasing_entries", "respect_stop_loss"],
    createdAt: daysAgoKey(60) + "T00:00:00.000Z",
  };

  const peers: { uid: string; name: string; arch: UserProfile["archetypeId"]; streak: number; state: BoardRow["state"]; score: number | null }[] = [
    { uid: "demo-amina", name: "Amina", arch: "perfectionist", streak: 19, state: "followedThrough", score: 86 },
    { uid: "demo-marcus", name: "Marcus", arch: "avenger", streak: 0, state: "repeatedMistake", score: 41 },
    { uid: "demo-yuki", name: "Yuki", arch: "hesitator", streak: 7, state: "improved", score: 78 },
    { uid: "demo-tariq", name: "Tariq", arch: "overconfident", streak: 3, state: "committed", score: null },
    { uid: "demo-lena", name: "Lena", arch: "validationSeeker", streak: 0, state: "absent", score: null },
  ];

  const members: RoomMember[] = [
    {
      uid: DEMO_UID,
      roomId: ROOM_ID,
      role: "member",
      displayName: profile.displayName,
      archetypeId: "chaser",
      joinedAt: room.createdAt,
      streak: 0,
      lastActiveDate: todayKey(),
      sharing: { score: true, nafs: true, reflections: true },
      weeklyPartnerUid: "demo-amina",
    },
    ...peers.map((p) => ({
      uid: p.uid,
      roomId: ROOM_ID,
      role: p.uid === room.ownerId ? ("owner" as const) : ("member" as const),
      displayName: p.name,
      archetypeId: p.arch,
      joinedAt: room.createdAt,
      streak: p.streak,
      lastActiveDate: p.state === "absent" ? daysAgoKey(3) : todayKey(),
      sharing: { score: true, nafs: true, reflections: false },
      weeklyPartnerUid: null,
    })),
  ];

  const today = todayKey();
  const board = new Map<string, BoardRow>();
  for (const p of peers) {
    board.set(`${today}:${p.uid}`, {
      uid: p.uid,
      date: today,
      displayName: p.name,
      state: p.state,
      committedCount: p.state === "absent" ? 0 : 3,
      reviewed: p.state === "followedThrough" || p.state === "improved" || p.state === "repeatedMistake",
      honoredRate: p.score !== null ? 0.9 : null,
      dayScore: p.score,
      streak: p.streak,
      trend: p.streak >= 7 ? "up" : p.state === "repeatedMistake" ? "down" : "flat",
      topNafs: p.state === "repeatedMistake" ? "ego" : null,
      updatedAt: today + "T17:00:00.000Z",
    });
  }

  const feed: RoomFeedEvent[] = [
    { id: "f1", roomId: ROOM_ID, type: "nudge", fromUid: "demo-amina", toUid: "demo-marcus", date: today, nudgeKind: "stayStrong", createdAt: today + "T17:10:00.000Z" },
    { id: "f2", roomId: ROOM_ID, type: "nudge", fromUid: "demo-yuki", toUid: DEMO_UID, date: today, nudgeKind: "proudOfYou", createdAt: today + "T16:40:00.000Z" },
    { id: "f3", roomId: ROOM_ID, type: "sharedReflection", fromUid: "demo-amina", date: today, text: "Cutting winners early was my pattern. This week I let two runners breathe.", createdAt: today + "T09:00:00.000Z" },
  ];

  const reflections: WeeklyReflection[] = [
    {
      id: weekId(new Date(Date.now() - 7 * 864e5)),
      userId: DEMO_UID,
      weekStart: weekStartKey(new Date(Date.now() - 7 * 864e5)),
      createdAt: daysAgoKey(7) + "T20:00:00.000Z",
      improved: "I sat out three setups that didn't meet my criteria.",
      repeated: "Still chased one breakout on Tuesday.",
      triggers: "Watching the room post green while I was flat.",
      nextWeek: "When I feel the FOMO spike, I will close the platform for 5 minutes.",
      summary:
        "A clear week of progress: your patience is improving and you're skipping low-quality setups. The remaining leak is FOMO when peers are winning — your commitment to step away is exactly right.",
    },
  ];

  const interventions: Intervention[] = [
    {
      id: "demo-interv-1",
      userId: DEMO_UID,
      type: "focusChallenge",
      trigger: "nafsSpike",
      title: "A recurring internal battle.",
      message:
        "Impatience is behind most of your recent violations. Consider a 3-day focus challenge: one commitment — wait for the setup — honored each day.",
      escalationLevel: 5,
      status: "active",
      createdAt: daysAgoKey(1) + "T21:00:00.000Z",
    },
  ];

  return { profile, assessment, dailies, incidents, reflections, interventions, room, members, board, feed };
}

export function demo(): DemoData {
  if (!DATA) DATA = seed();
  return DATA;
}

export const DEMO_USER = {
  uid: DEMO_UID,
  email: "demo@niyyah.os",
  displayName: "Sam (Demo)",
};
