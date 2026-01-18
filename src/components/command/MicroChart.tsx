import * as React from "react";
import { cn } from "@/lib/utils";

interface MicroChartProps {
  data: number[];
  max?: number;
  className?: string;
  color?: "accent" | "success" | "danger" | "warning";
}

export const MicroSparkline: React.FC<MicroChartProps> = ({
  data,
  max,
  className,
  color = "accent",
}) => {
  const maxValue = max || Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const colorMap = {
    accent: "hsl(var(--accent))",
    success: "hsl(var(--success))",
    danger: "hsl(var(--danger))",
    warning: "hsl(var(--warning))",
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-8 w-16", className)}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
};

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: "accent" | "success" | "danger" | "warning";
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 32,
  strokeWidth = 3,
  className,
  color = "accent",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  const colorMap = {
    accent: "hsl(var(--accent))",
    success: "hsl(var(--success))",
    danger: "hsl(var(--danger))",
    warning: "hsl(var(--warning))",
  };

  return (
    <svg
      width={size}
      height={size}
      className={cn("transform -rotate-90", className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 300ms ease" }}
      />
    </svg>
  );
};

interface StreakDotsProps {
  days: boolean[];
  className?: string;
}

export const StreakDots: React.FC<StreakDotsProps> = ({ days, className }) => {
  return (
    <div className={cn("flex gap-1", className)}>
      {days.map((active, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            active ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--border))]",
          )}
        />
      ))}
    </div>
  );
};
