import * as React from "react";
import { cn } from "@/lib/utils";

interface GlowBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "accent" | "success" | "danger" | "warning" | "neutral";
  glow?: boolean;
  pulse?: boolean;
}

export const GlowBadge = React.forwardRef<HTMLDivElement, GlowBadgeProps>(
  (
    {
      className,
      variant = "accent",
      glow = false,
      pulse = false,
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      accent:
        "bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.3)]",
      success:
        "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]",
      danger:
        "bg-[hsl(var(--danger)/0.1)] text-[hsl(var(--danger))] border-[hsl(var(--danger)/0.3)]",
      warning:
        "bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.3)]",
      neutral:
        "bg-[hsl(var(--surface2))] text-muted border-[hsl(var(--border))]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-[var(--radius)] border",
          variantStyles[variant],
          glow && variant === "accent" && "glow-accent",
          pulse && "animate-pulse",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GlowBadge.displayName = "GlowBadge";
