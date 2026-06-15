import type { SVGProps } from "react";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type IconName =
  | "dashboard"
  | "daily"
  | "patterns"
  | "reflection"
  | "archetype"
  | "partner"
  | "nafs"
  | "settings";

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const paths: Record<IconName, React.ReactNode> = {
    dashboard: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12l4-3" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
    daily: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2.5" />
        <path d="M4 9h16M8 3v4M16 3v4M9 14l2 2 4-4" />
      </>
    ),
    patterns: (
      <>
        <path d="M4 18l5-6 4 3 7-9" />
        <path d="M20 6h-3M20 6v3" />
      </>
    ),
    reflection: (
      <>
        <path d="M5 6h14M5 12h14M5 18h9" />
      </>
    ),
    archetype: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
      </>
    ),
    partner: (
      <>
        <circle cx="8" cy="9" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M2.5 19c0-2.8 2.4-5 5.5-5s5.5 2.2 5.5 5M15 19c0-1.8.8-3.4 2-4" />
      </>
    ),
    nafs: (
      <>
        <path d="M12 21c-4-2.5-7-5.6-7-9.8A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 3.2c0 4.2-3 7.3-7 9.8z" />
        <path d="M12 8v5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </>
    ),
  };
  return (
    <svg {...base} {...props}>
      {paths[name]}
    </svg>
  );
}
