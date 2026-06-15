import { cn } from "@/lib/utils";

/**
 * A calm circular gauge for the discipline index (0–100). No color alarmism —
 * the arc deepens toward evergreen as discipline grows.
 */
export function ScoreDial({
  value,
  label,
  size = 168,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7E2D8"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2E4A40"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl text-ink">{Math.round(clamped)}</span>
        {label ? (
          <span className="mt-0.5 text-xs uppercase tracking-[0.14em] text-faint">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function DimensionBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("", className)}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm text-ink">{label}</span>
        <span className="text-sm tabular-nums text-muted">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
