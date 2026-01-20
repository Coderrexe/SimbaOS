"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, SkipForward, Target, Clock, Zap } from "lucide-react";
import { useCommand } from "@/lib/command-context";
import { Surface } from "./Surface";
import { GlowBadge } from "./GlowBadge";

export function RightNowOverlay() {
  const { showRightNow, setShowRightNow, sharedTimer, setSharedTimer } =
    useCommand();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const lastSaveTimeRef = useRef(0);

  // Recommended task (would come from actual data)
  const recommendedTask = {
    id: "1",
    title: "Your most important task",
    why: "High priority, optimal time to focus",
    impact: "Move your most critical project forward",
    estimatedTime: 25,
  };

  // Sync with shared timer
  useEffect(() => {
    setSessionId(sharedTimer.sessionId);
  }, [sharedTimer]);

  // Auto-save progress
  useEffect(() => {
    if (!sharedTimer.isRunning || !sharedTimer.sessionId) return;

    const saveInterval = setInterval(async () => {
      const minutes = Math.floor(accumulatedSeconds / 60);
      if (minutes > 0 && minutes !== lastSaveTimeRef.current) {
        try {
          await fetch(`/api/pomodoro/${sharedTimer.sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              duration: minutes,
              completedAt: null,
            }),
          });
          lastSaveTimeRef.current = minutes;
          window.dispatchEvent(new Event("pomodoro-complete"));
        } catch (error) {
          console.error("Error saving progress:", error);
        }
      }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [sharedTimer.isRunning, sharedTimer.sessionId, accumulatedSeconds]);

  // Track accumulated time
  useEffect(() => {
    if (!sharedTimer.isRunning) return;

    const interval = setInterval(() => {
      setAccumulatedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sharedTimer.isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    if (!sharedTimer.isRunning) {
      // Create new session
      const response = await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WORK",
          duration: 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.id);
        setAccumulatedSeconds(0);
        lastSaveTimeRef.current = 0;
        setSharedTimer({
          isRunning: true,
          timeLeft: 25 * 60,
          sessionId: data.id,
          phase: "work",
        });
      }
    } else {
      // Pause
      const minutes = Math.floor(accumulatedSeconds / 60);
      if (minutes > 0 && sharedTimer.sessionId) {
        await fetch(`/api/pomodoro/${sharedTimer.sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duration: minutes,
            completedAt: null,
          }),
        });
        window.dispatchEvent(new Event("pomodoro-complete"));
      }
      setSharedTimer({
        ...sharedTimer,
        isRunning: false,
      });
    }
  };

  const handleComplete = async () => {
    if (sharedTimer.sessionId && accumulatedSeconds > 0) {
      const minutes = Math.floor(accumulatedSeconds / 60);
      if (minutes > 0) {
        await fetch(`/api/pomodoro/${sharedTimer.sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completedAt: new Date().toISOString(),
            duration: minutes,
          }),
        });
        window.dispatchEvent(new Event("pomodoro-complete"));
      }
    }
    setSharedTimer({
      isRunning: false,
      timeLeft: 25 * 60,
      sessionId: null,
      phase: "work",
    });
    setSessionId(null);
    setAccumulatedSeconds(0);
    lastSaveTimeRef.current = 0;
    setShowRightNow(false);
  };

  // ESC key handler
  useEffect(() => {
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
                  {formatTime(sharedTimer.timeLeft)}
                </div>

                <div className="flex justify-center gap-3">
                  {!sharedTimer.isRunning ? (
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
                        onClick={handleStart}
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
