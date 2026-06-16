import { cn } from "@/lib/utils";

/**
 * A calm circular gauge. The arc is an evergreen→brass gradient that deepens as
 * the value grows. No color alarmism.
 */
export function ScoreDial({
  value,
  label,
  size = 176,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E6E0D5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#dial-g)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="dial-g" x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
            <stop stopColor="#2E4A40" />
            <stop offset="1" stopColor="#9C7C4D" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-[2.75rem] leading-none text-ink">{Math.round(clamped)}</span>
        {label ? <span className="mt-1.5 label">{label}</span> : null}
      </div>
    </div>
  );
}

export function DimensionBar({
  label,
  value,
  tone = "accent",
  className,
}: {
  label: string;
  value: number;
  tone?: "accent" | "breach";
  className?: string;
}) {
  const fill = tone === "breach" ? "bg-breach/70" : "bg-gradient-to-r from-accent to-affirm";
  return (
    <div className={cn("", className)}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm text-ink">{label}</span>
        <span className="text-sm tabular-nums text-muted">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-sand">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", fill)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
