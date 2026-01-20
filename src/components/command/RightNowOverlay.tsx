"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, SkipForward, Target, Clock, Zap } from "lucide-react";
import { useCommand } from "@/lib/command-context";
import { Surface } from "./Surface";
import { GlowBadge } from "./GlowBadge";

export function RightNowOverlay() {
  const { showRightNow, setShowRightNow, focusTimer, startFocus, stopFocus } =
    useCommand();
  const [timeLeft, setTimeLeft] = React.useState(25 * 60); // 25 minutes in seconds

  // Recommended task (would come from actual data)
  const recommendedTask = {
    id: "1",
    title: "Your most important task",
    why: "High priority, optimal time to focus",
    impact: "Move your most critical project forward",
    estimatedTime: 25,
  };

  React.useEffect(() => {
    if (!focusTimer.active) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - (focusTimer.startTime || 0)) / 1000,
      );
      const remaining = focusTimer.duration * 60 - elapsed;

      if (remaining <= 0) {
        stopFocus();
        setTimeLeft(25 * 60);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [focusTimer, stopFocus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    startFocus(recommendedTask.id, 25);
    setTimeLeft(25 * 60);
  };

  const handleComplete = () => {
    stopFocus();
    setShowRightNow(false);
    // TODO: Mark task as complete
  };

  // ESC key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showRightNow) {
        setShowRightNow(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showRightNow, setShowRightNow]);

  return (
    <AnimatePresence>
      {showRightNow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--bg))] backdrop-blur-sm p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl my-auto"
          >
            <Surface
              level={2}
              className="p-8 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setShowRightNow(false)}
                className="absolute top-4 right-4 p-2 rounded-[var(--radius)] hover:bg-[hsl(var(--surface3))] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--accent-muted))] mb-4">
                  <Zap className="h-8 w-8 text-[hsl(var(--accent))]" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Right Now</h2>
                <p className="text-muted">
                  Your most important task at this moment
                </p>
              </div>

              {/* Recommended Task */}
              <div className="mb-8 p-6 rounded-[var(--radius-lg)] surface-2">
                <h3 className="text-lg font-semibold mb-3">
                  {recommendedTask.title}
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted mb-1">
                        Why this now
                      </div>
                      <div className="text-sm">{recommendedTask.why}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted mb-1">Impact</div>
                      <div className="text-sm">{recommendedTask.impact}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <GlowBadge variant="accent">
                    <Clock className="h-3 w-3" />
                    {recommendedTask.estimatedTime}m
                  </GlowBadge>
                </div>
              </div>

              {/* Focus Timer */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold mb-4 tabular-nums">
                  {formatTime(timeLeft)}
                </div>

                <div className="flex justify-center gap-3">
                  {!focusTimer.active ? (
                    <button
                      onClick={handleStart}
                      className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] bg-[hsl(var(--accent))] text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      <Play className="h-5 w-5" />
                      Start Focus (25m)
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={stopFocus}
                        className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] surface-2 font-medium hover:surface-3 transition-all"
                      >
                        <Pause className="h-5 w-5" />
                        Pause
                      </button>
                      <button
                        onClick={handleComplete}
                        className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] bg-[hsl(var(--success))] text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        <SkipForward className="h-5 w-5" />
                        Complete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Keyboard hint */}
              <div className="text-center text-xs text-subtle">
                Press{" "}
                <kbd className="px-2 py-1 rounded bg-[hsl(var(--surface3))] font-mono">
                  Esc
                </kbd>{" "}
                to close
              </div>
            </Surface>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
