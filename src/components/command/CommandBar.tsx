"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCommand } from "@/lib/command-context";
import { Brain, Zap, Sparkles, Plus, Play, Pause } from "lucide-react";

export function CommandBar() {
  const { mode, setMode, focusTimer } = useCommand();
  const [captureValue, setCaptureValue] = React.useState("");

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureValue.trim()) return;

    // Parse and route capture
    // TODO: Implement smart parsing
    console.log("Captured:", captureValue);
    setCaptureValue("");
  };

  const modes = [
    {
      id: "plan" as const,
      label: "Plan",
      icon: Brain,
      hint: "Prioritize & organize",
    },
    {
      id: "execute" as const,
      label: "Execute",
      icon: Zap,
      hint: "Focus & ship",
    },
    {
      id: "reflect" as const,
      label: "Reflect",
      icon: Sparkles,
      hint: "Review & learn",
    },
  ];

  return (
    <div className="fixed bottom-0 left-16 right-0 h-14 glass-strong border-t border-[hsl(var(--border))] z-30 flex items-center px-6 gap-6">
      {/* Mode Switcher */}
      <div className="flex gap-1 p-1 rounded-[var(--radius-lg)] bg-[hsl(var(--surface2))]">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "relative flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all",
                mode === m.id
                  ? "text-[hsl(var(--accent))]"
                  : "text-muted hover:text-[hsl(var(--text))]",
              )}
            >
              {mode === m.id && (
                <motion.div
                  layoutId="mode-indicator"
                  className="absolute inset-0 bg-[hsl(var(--accent-muted))] rounded-[var(--radius)]"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Focus Timer Status */}
      {focusTimer.active && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-lg)] bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))]">
          <Play className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            Focus: {focusTimer.duration}m
          </span>
        </div>
      )}

      {/* Quick Capture */}
      <form onSubmit={handleCapture} className="flex-1 max-w-md">
        <div className="relative">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={captureValue}
            onChange={(e) => setCaptureValue(e.target.value)}
            placeholder="Quick capture... (⌘K for more)"
            className="w-full h-9 pl-10 pr-4 rounded-[var(--radius-lg)] bg-[hsl(var(--surface))] border border-[hsl(var(--border-subtle))] text-sm placeholder:text-muted focus:outline-none focus:border-[hsl(var(--accent))] focus:ring-1 focus:ring-[hsl(var(--accent)/0.2)] transition-all"
          />
        </div>
      </form>

      {/* Hints */}
      <div className="text-xs text-subtle">
        {mode === "plan" && "Organize your priorities"}
        {mode === "execute" && "Ship what matters"}
        {mode === "reflect" && "Learn and improve"}
      </div>
    </div>
  );
}
