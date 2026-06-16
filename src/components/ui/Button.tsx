import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "quiet" | "gold";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-soft hover:bg-accent-hover hover:shadow-lift " +
    "active:translate-y-px disabled:opacity-50 disabled:shadow-none",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-raised hover:border-ink/20 " +
    "active:translate-y-px disabled:opacity-50",
  ghost: "text-ink hover:bg-sand/70 active:translate-y-px disabled:opacity-40",
  quiet: "text-muted hover:text-ink",
  gold:
    "text-white shadow-gold bg-gradient-to-b from-[#b08d57] to-[#9c7c4d] " +
    "hover:from-[#a8854f] hover:to-[#8f6f42] active:translate-y-px disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-[3.25rem] px-7 text-[15px] rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-medium transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
