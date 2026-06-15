"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listNafsIncidents } from "@/services/nafsService";
import { listDailies } from "@/services/dailyService";
import { rankedNafs, tallyNafs, totalIncidents } from "@/domain/nafs/analytics";
import { NAFS_LABELS, type DailyEntry, type NafsIncident } from "@/domain/types";
import { daysAgoKey } from "@/lib/dates";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const WINDOWS = [
  { key: 7, label: "7 days" },
  { key: 30, label: "30 days" },
  { key: 90, label: "90 days" },
] as const;

export function NafsTracker() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<NafsIncident[]>([]);
  const [days, setDays] = useState<DailyEntry[]>([]);
  const [window, setWindow] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [inc, hist] = await Promise.all([
        listNafsIncidents(user.uid, daysAgoKey(90)),
        listDailies(user.uid, daysAgoKey(90)),
      ]);
      setIncidents(inc);
      setDays(hist);
      setLoading(false);
    })();
  }, [user]);

  const since = daysAgoKey(window);
  const tally = tallyNafs(incidents, since);
  const ranked = rankedNafs(tally);
  const total = totalIncidents(tally);
  const max = Math.max(1, ...ranked.map((r) => r.count));
  const activeDays = days.filter((d) => d.reviewedAt && d.date >= since).length;

  return (
    <Page>
      <PageHeader
        eyebrow="Nafs Battle Tracker"
        title="The battles beneath your trades"
        description="Every violation has a root cause. Trades are symptoms; the nafs is the source. Win these internal battles and the mistakes disappear."
      />

      <div className="mb-6 flex gap-2">
        {WINDOWS.map((w) => (
          <button
            key={w.key}
            onClick={() => setWindow(w.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-all",
              window === w.key
                ? "border-accent bg-accent-soft text-accent-ink"
                : "border-line text-muted hover:bg-raised",
            )}
          >
            {w.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      ) : total === 0 ? (
        <Card>
          <p className="text-muted">
            No violations logged in this window. Either a disciplined stretch — or
            time to be more honest in your reviews. Both are worth noticing.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Stat label="Total incidents" value={`${total}`} />
            <Stat label="Active days" value={`${activeDays}`} />
            <Stat label="Per active day" value={activeDays ? (total / activeDays).toFixed(1) : "—"} />
          </div>

          <Card>
            <div className="space-y-4">
              {ranked.map((r) => (
                <div key={r.category}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm text-ink">{NAFS_LABELS[r.category]}</span>
                    <span className="text-sm tabular-nums text-muted">{r.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full rounded-full bg-breach/70 transition-[width] duration-700"
                      style={{ width: `${(r.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="font-serif text-2xl text-ink">{value}</p>
      <p className="text-xs text-faint">{label}</p>
    </Card>
  );
}
