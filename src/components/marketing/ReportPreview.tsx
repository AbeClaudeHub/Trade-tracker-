import { Pill } from "@/components/ui/Pill";

/** A decorative, static preview of a report — makes the product tangible. */
const ROWS: [string, number][] = [
  ["Discipline", 45],
  ["Patience", 32],
  ["Impulsiveness", 38],
  ["Risk Behavior", 58],
];

export function ReportPreview() {
  return (
    <div className="relative">
      {/* back card for depth */}
      <div className="absolute -right-3 top-4 h-full w-full rounded-3xl border border-line bg-raised/70 shadow-soft" />
      <div className="relative grain overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-lift">
        <div className="flex items-center gap-4">
          <span className="relative inline-flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/15 to-gold/20" />
            <span className="absolute inset-[3px] rounded-full border border-gold-line/60 bg-surface" />
            <span className="relative font-serif text-2xl text-gradient">C</span>
          </span>
          <div>
            <p className="label mb-0.5">Trader archetype</p>
            <p className="font-serif text-xl leading-none text-ink">The Chaser</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Pill tone="breach">Dominant nafs · Impatience</Pill>
          <Pill tone="neutral">Secondary · Gambler</Pill>
        </div>

        <div className="mt-5 space-y-3">
          {ROWS.map(([label, v]) => (
            <div key={label}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs text-ink">{label}</span>
                <span className="text-xs tabular-nums text-faint">{v}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-affirm"
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-gold-line/40 bg-gold-soft/40 px-4 py-3">
          <p className="label mb-1">Keystone commitment</p>
          <p className="text-sm font-medium text-ink">I only enter inside my defined window.</p>
        </div>
      </div>
    </div>
  );
}
