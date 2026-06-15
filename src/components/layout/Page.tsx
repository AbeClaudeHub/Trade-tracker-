import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12", className)}>
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
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? <p className="label mb-2">{eyebrow}</p> : null}
        <h1 className="font-serif text-title text-ink">{title}</h1>
        {description ? (
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
