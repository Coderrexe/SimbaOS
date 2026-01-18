import * as React from "react";
import { cn } from "@/lib/utils";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  glass?: boolean;
  glow?: boolean;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, level = 1, glass = false, glow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-lg)]",
          glass
            ? "glass"
            : level === 1
              ? "surface"
              : level === 2
                ? "surface-2"
                : "surface-3",
          glow && "glow-accent",
          className,
        )}
        {...props}
      />
    );
  },
);
Surface.displayName = "Surface";
