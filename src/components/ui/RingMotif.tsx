import { cn } from "@/lib/utils";

/**
 * The signature "intention" motif — concentric rings around a single held
 * point. Used as a calm, branded ambient backdrop behind hero/cover sections.
 * Purely decorative.
 */
export function RingMotif({
  className,
  withOrbit = true,
}: {
  className?: string;
  withOrbit?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
    >
      <defs>
        <linearGradient id="ring-motif-g" x1="40" y1="40" x2="360" y2="360" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2E4A40" />
          <stop offset="1" stopColor="#9C7C4D" />
        </linearGradient>
        <radialGradient id="ring-motif-glow" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#2E4A40" stopOpacity="0.10" />
          <stop offset="1" stopColor="#2E4A40" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#ring-motif-glow)" />
      {[60, 100, 140, 180].map((r, i) => (
        <circle
          key={r}
          cx="200"
          cy="200"
          r={r}
          stroke="url(#ring-motif-g)"
          strokeOpacity={0.18 - i * 0.03}
          strokeWidth="1"
        />
      ))}
      <circle cx="200" cy="200" r="9" fill="url(#ring-motif-g)" />
      {withOrbit ? (
        <g className="origin-center motion-safe:animate-[spin_28s_linear_infinite]">
          <circle cx="200" cy="60" r="4" fill="#9C7C4D" fillOpacity="0.8" />
        </g>
      ) : null}
    </svg>
  );
}
