import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-5xl px-5 py-9 md:px-8 md:py-14 animate-fade-up",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-9 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="label mb-3 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-title text-ink text-balance">{title}</h1>
        {description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-muted text-pretty">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
