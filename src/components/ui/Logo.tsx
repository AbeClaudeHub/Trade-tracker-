import { cn } from "@/lib/utils";

/**
 * Niyyah wordmark. The mark is a single deliberate point held at the centre of
 * an open ring — intention, focused. Quiet, premium, scalable.
 */
export function Logo({
  className,
  showWord = true,
  size = 28,
}: {
  className?: string;
  showWord?: boolean;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <circle cx="16" cy="16" r="13" stroke="url(#niyyah-g)" strokeWidth="1.6" />
        <circle cx="16" cy="16" r="3.4" fill="url(#niyyah-g)" />
        <defs>
          <linearGradient id="niyyah-g" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2E4A40" />
            <stop offset="1" stopColor="#9C7C4D" />
          </linearGradient>
        </defs>
      </svg>
      {showWord ? (
        <span className="font-serif text-lg leading-none tracking-tight text-ink">
          Niyyah<span className="text-faint"> OS</span>
        </span>
      ) : null}
    </span>
  );
}
