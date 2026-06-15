import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const DISAPPEAR_DAYS = 3;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgoKey(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return dayKey(d);
}

/**
 * Hourly reconciliation across all rooms:
 *  - mark members "absent" on today's board if they have no row past cutoff,
 *  - recompute room aggregate rollups from today's board rows,
 *  - raise a "disappearance" intervention for members inactive ≥ DISAPPEAR_DAYS.
 *
 * At ~7 members/room this is cheap; sharding/queues can be added at scale.
 */
export const reconcileRooms = onSchedule("every 60 minutes", async () => {
  const today = dayKey(new Date());
  const rooms = await db.collection("rooms").get();

  for (const roomSnap of rooms.docs) {
    const roomId = roomSnap.id;
    const members = await db.collection(`rooms/${roomId}/members`).get();
    const rows = await db.collection(`rooms/${roomId}/board/${today}/rows`).get();
    const rowByUid = new Map(rows.docs.map((d) => [d.id, d.data()]));

    let scoreSum = 0;
    let scoreN = 0;
    let honoredSum = 0;
    let honoredN = 0;
    let cleanDays = 0;

    for (const memberSnap of members.docs) {
      const uid = memberSnap.id;
      const member = memberSnap.data();
      const row = rowByUid.get(uid);

      if (!row) {
        // No activity today — surface as absent on the board.
        await db.doc(`rooms/${roomId}/board/${today}/rows/${uid}`).set(
          {
            uid,
            date: today,
            displayName: member.displayName ?? "Member",
            state: "absent",
            committedCount: 0,
            reviewed: false,
            honoredRate: null,
            dayScore: null,
            streak: member.streak ?? 0,
            trend: "flat",
            topNafs: null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      } else {
        if (typeof row.dayScore === "number") {
          scoreSum += row.dayScore;
          scoreN += 1;
        }
        if (typeof row.honoredRate === "number") {
          honoredSum += row.honoredRate;
          honoredN += 1;
        }
        if (row.state === "followedThrough" || row.state === "improved") cleanDays += 1;
      }

      // Disappearance intervention.
      const last = member.lastActiveDate as string | null;
      if (!last || last <= daysAgoKey(DISAPPEAR_DAYS)) {
        const intervRef = db.collection(`users/${uid}/interventions`);
        const existing = await intervRef
          .where("trigger", "==", "disappearance")
          .where("status", "==", "active")
          .limit(1)
          .get();
        if (existing.empty) {
          await intervRef.add({
            userId: uid,
            type: "partnerNotification",
            trigger: "disappearance",
            title: "We've missed you.",
            message:
              "You haven't checked in for a few days. This is exactly when accountability matters most. Your room would rather support you than watch you vanish.",
            escalationLevel: 6,
            status: "active",
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    await db.doc(`rooms/${roomId}/rollups/current`).set(
      {
        avgDiscipline: scoreN ? Math.round(scoreSum / scoreN) : 0,
        completionRate: honoredN ? honoredSum / honoredN : 0,
        cleanDaysWeek: cleanDays,
        reviewStreak: 0,
        violationReductionPct: 0,
        mostImprovedUid: null,
        biggestBattle: null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  logger.info(`Reconciled ${rooms.size} rooms for ${today}`);
});

/**
 * Weekly rotating in-room accountability pairing. Each Monday, pair members
 * within each room so everyone has one peer to specifically check on.
 */
export const rotatePartners = onSchedule(
  { schedule: "every monday 06:00", timeZone: "UTC" },
  async () => {
    const rooms = await db.collection("rooms").get();
    for (const roomSnap of rooms.docs) {
      const members = await db.collection(`rooms/${roomSnap.id}/members`).get();
      const uids = members.docs.map((d) => d.id);
      // Simple rotation: pair i with i+1, last wraps to first.
      for (let i = 0; i < uids.length; i++) {
        const partner = uids[(i + 1) % uids.length] ?? null;
        await db
          .doc(`rooms/${roomSnap.id}/members/${uids[i]}`)
          .set({ weeklyPartnerUid: uids.length > 1 ? partner : null }, { merge: true });
      }
    }
    logger.info(`Rotated partners across ${rooms.size} rooms`);
  },
);
