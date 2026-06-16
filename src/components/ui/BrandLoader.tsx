import { cn } from "@/lib/utils";

/** A calm, branded loading state — a held point inside a breathing ring. */
export function BrandLoader({ className, fullscreen = false }: { className?: string; fullscreen?: boolean }) {
  const mark = (
    <span className="relative inline-flex h-12 w-12 items-center justify-center">
      <span className="absolute inset-0 rounded-full border border-accent/25" />
      <span className="absolute inset-0 rounded-full border border-accent/40 motion-safe:animate-ping" />
      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-accent to-gold" />
    </span>
  );
  if (fullscreen) {
    return <div className="flex min-h-screen items-center justify-center">{mark}</div>;
  }
  return <div className={cn("flex justify-center py-24", className)}>{mark}</div>;
}
