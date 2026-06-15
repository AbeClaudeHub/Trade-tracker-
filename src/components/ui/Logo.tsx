import { cn } from "@/lib/utils";

/**
 * Niyyah wordmark. The mark is a single deliberate point inside an open ring —
 * intention held at the centre. Quiet, not loud.
 */
export function Logo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-[1.5px] border-accent/70" />
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
      {showWord ? (
        <span className="font-serif text-lg leading-none tracking-tight text-ink">
          Niyyah<span className="text-faint"> OS</span>
        </span>
      ) : null}
    </span>
  );
}
