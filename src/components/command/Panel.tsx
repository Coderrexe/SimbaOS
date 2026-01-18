import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Surface } from "./Surface";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  glass?: boolean;
  glow?: boolean;
  selected?: boolean;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      className,
      title,
      subtitle,
      action,
      glass = false,
      glow = false,
      selected = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Surface
        ref={ref}
        glass={glass}
        glow={glow}
        className={cn(
          "relative p-[var(--space-4)] lift-on-hover",
          selected && "selected",
          className,
        )}
        {...props}
      >
        {(title || subtitle || action) && (
          <div className="mb-[var(--space-3)] flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-sm font-semibold tracking-tight text-[hsl(var(--text))]">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-xs text-muted">{subtitle}</p>
              )}
            </div>
            {action && <div className="ml-4">{action}</div>}
          </div>
        )}
        {children}
      </Surface>
    );
  },
);
Panel.displayName = "Panel";
