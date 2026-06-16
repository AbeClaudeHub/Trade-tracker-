import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "quiet" | "accent" | "gold";
  hover?: boolean;
  inset?: boolean;
}

const variants: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "border-line bg-surface shadow-soft",
  quiet: "border-line bg-raised",
  accent: "border-accent/20 bg-accent-soft/40",
  gold: "border-gold-line/60 bg-gold-soft/40",
};

export function Card({
  className,
  variant = "default",
  hover = false,
  inset = true,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300",
        variants[variant],
        inset && "p-6 md:p-7",
        hover && "hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <h3 className="font-serif text-lg text-ink">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </div>
  );
}
