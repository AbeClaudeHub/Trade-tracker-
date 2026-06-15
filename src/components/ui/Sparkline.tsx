import type { BehaviorTrendPoint } from "@/domain/types";

/** A quiet line of behavior over time. Zero line drawn for reference. */
export function Sparkline({
  data,
  width = 520,
  height = 120,
}: {
  data: BehaviorTrendPoint[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) {
    return (
      <div className="flex h-[120px] items-center justify-center text-sm text-faint">
        A few more days of check-ins and your trend will appear here.
      </div>
    );
  }

  const pad = 8;
  const scores = data.map((d) => d.score);
  const min = Math.min(-1, ...scores);
  const max = Math.max(1, ...scores);
  const range = max - min || 1;

  const x = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2);

  const line = data.map((d, i) => `${x(i)},${y(d.score)}`).join(" ");
  const zeroY = y(0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="#E7E2D8" strokeWidth={1} strokeDasharray="3 4" />
      <polyline
        points={line}
        fill="none"
        stroke="#2E4A40"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <circle key={d.date} cx={x(i)} cy={y(d.score)} r={2.5} fill="#2E4A40" />
      ))}
    </svg>
  );
}
