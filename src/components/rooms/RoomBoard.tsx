"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  getBoard,
  getMembers,
  getRoom,
  listFeed,
  sendNudge,
} from "@/services/roomService";
import {
  NAFS_LABELS,
  type BoardRow,
  type DayState,
  type NudgeKind,
  type Room,
  type RoomFeedEvent,
  type RoomMember,
} from "@/domain/types";
import { todayKey, formatLongDate } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STATE_META: Record<DayState, { label: string; cls: string }> = {
  committed: { label: "Committed", cls: "bg-accent-soft text-accent-ink" },
  awaitingReview: { label: "Awaiting review", cls: "bg-cautionsoft text-caution" },
  followedThrough: { label: "Followed through", cls: "bg-affirmsoft text-affirm" },
  improved: { label: "Improved", cls: "bg-affirmsoft text-affirm" },
  repeatedMistake: { label: "Broke a rule", cls: "bg-breachsoft text-breach" },
  absent: { label: "Absent today", cls: "bg-sand text-muted" },
};

const NUDGES: { kind: NudgeKind; label: string }[] = [
  { kind: "respect", label: "Respect" },
  { kind: "stayStrong", label: "Stay strong" },
  { kind: "checkIn", label: "Check in?" },
  { kind: "proudOfYou", label: "Proud of you" },
];

export function RoomBoard({ roomId }: { roomId: string }) {
  const { user, profile } = useAuth();
  const date = todayKey();
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [feed, setFeed] = useState<RoomFeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [nudgingUid, setNudgingUid] = useState<string | null>(null);

  async function load() {
    const [r, m, b, f] = await Promise.all([
      getRoom(roomId),
      getMembers(roomId),
      getBoard(roomId, date),
      listFeed(roomId),
    ]);
    setRoom(r);
    setMembers(m);
    setRows(b);
    setFeed(f);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  async function nudge(toUid: string, kind: NudgeKind) {
    if (!user) return;
    setNudgingUid(toUid);
    await sendNudge(roomId, user.uid, toUid, kind, date);
    await listFeed(roomId).then(setFeed);
    setNudgingUid(null);
  }

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  if (!room) {
    return (
      <Page>
        <Card>
          <p className="text-muted">This room could not be found.</p>
          <Link href="/rooms" className="mt-3 inline-block text-accent">← Back to rooms</Link>
        </Card>
      </Page>
    );
  }

  // Merge members with today's rows (members without a row are absent).
  const rowByUid = new Map(rows.map((r) => [r.uid, r]));
  const board = members.map((m) => ({
    member: m,
    row:
      rowByUid.get(m.uid) ??
      ({
        uid: m.uid,
        date,
        displayName: m.displayName,
        state: "absent" as DayState,
        committedCount: 0,
        reviewed: false,
        honoredRate: null,
        dayScore: null,
        streak: m.streak,
        trend: "flat" as const,
        topNafs: null,
        updatedAt: "",
      } satisfies BoardRow),
  }));

  const committedCount = board.filter((b) => b.row.state !== "absent").length;
  const reviewedCount = board.filter((b) => b.row.reviewed).length;
  const onStreak = board.filter((b) => b.row.streak >= 3).length;
  const sharedScores = board.map((b) => b.row.dayScore).filter((s): s is number => s !== null);
  const avgScore = sharedScores.length
    ? Math.round(sharedScores.reduce((a, c) => a + c, 0) / sharedScores.length)
    : null;

  return (
    <Page>
      <PageHeader
        eyebrow={formatLongDate(date)}
        title={room.name}
        description={`${room.memberCount} traders · invite code ${room.inviteCode}`}
        action={
          <Link href="/daily">
            <Button>My check-in</Button>
          </Link>
        }
      />

      {/* Room pulse */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Pulse label="Committed today" value={`${committedCount}/${members.length}`} />
          <Pulse label="Reviewed" value={`${reviewedCount}/${members.length}`} />
          <Pulse label="On a streak" value={`${onStreak}`} />
          <Pulse label="Room avg score" value={avgScore !== null ? `${avgScore}` : "—"} />
        </div>
      </Card>

      {/* The board */}
      <div className="space-y-3">
        {board.map(({ member, row }) => {
          const meta = STATE_META[row.state];
          const isMe = member.uid === user?.uid;
          return (
            <Card key={member.uid} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sand font-serif text-ink">
                    {member.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-ink">
                      {member.displayName} {isMe ? <span className="text-faint">(you)</span> : null}
                      {member.role === "owner" ? <span className="ml-1 text-xs text-faint">· owner</span> : null}
                    </p>
                    <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium", meta.cls)}>
                      {meta.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-right">
                  <Metric label="Score" value={row.dayScore !== null ? `${row.dayScore}` : "private"} />
                  <Metric label="Streak" value={`${row.streak}`} />
                  <Metric label="Trend" value={row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→"} />
                </div>
              </div>

              {row.topNafs ? (
                <p className="mt-2 text-xs text-muted">Today&apos;s battle: {NAFS_LABELS[row.topNafs]}</p>
              ) : null}

              {!isMe ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {NUDGES.map((n) => (
                    <button
                      key={n.kind}
                      onClick={() => nudge(member.uid, n.kind)}
                      disabled={nudgingUid === member.uid}
                      className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:bg-sand/60 hover:text-ink disabled:opacity-50"
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>

      {/* Feed */}
      <h2 className="mb-3 mt-8 font-serif text-lg text-ink">Room activity</h2>
      <Card>
        {feed.length === 0 ? (
          <p className="text-sm text-muted">No activity yet today. Be the first to commit.</p>
        ) : (
          <ul className="space-y-3">
            {feed.slice(0, 20).map((ev) => (
              <li key={ev.id} className="text-sm text-ink/90">
                {renderFeed(ev, members, user?.uid)}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}

function name(uid: string | undefined, members: RoomMember[], me?: string) {
  if (uid && uid === me) return "You";
  return members.find((m) => m.uid === uid)?.displayName ?? "A member";
}

function renderFeed(ev: RoomFeedEvent, members: RoomMember[], me?: string) {
  const from = name(ev.fromUid, members, me);
  if (ev.type === "nudge") {
    const labels: Record<string, string> = {
      respect: "sent respect to",
      stayStrong: "told",
      checkIn: "checked in on",
      proudOfYou: "is proud of",
    };
    return (
      <span>
        <span className="font-medium">{from}</span> {labels[ev.nudgeKind ?? "respect"]}{" "}
        <span className="font-medium">{name(ev.toUid, members, me)}</span>
        {ev.nudgeKind === "stayStrong" ? " to stay strong" : ""}.
      </span>
    );
  }
  if (ev.type === "sharedReflection") {
    return (
      <span>
        <span className="font-medium">{from}</span> shared a reflection: &ldquo;{ev.text}&rdquo;
      </span>
    );
  }
  return (
    <span>
      <span className="font-medium">{from}</span> posted a {ev.type}.
    </span>
  );
}

function Pulse({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-2xl text-ink">{value}</p>
      <p className="text-xs text-faint">{label}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-lg text-ink tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-faint">{label}</p>
    </div>
  );
}
