"use client";

import * as React from "react";
import { Panel } from "./Panel";
import { GlowBadge } from "./GlowBadge";
import { Play, Pause, RotateCcw, Timer, Coffee, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TimerMode = "pomodoro" | "elapsed";
type PomodoroPhase = "work" | "break";

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

const startSound = new Audio(
  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77eeeTRAMUKfj8LZjHAY4ktfyy3ksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Ik2CBhnu+3nnk0QDFCn4/C2YxwGOJLX8st5LAUkd8fw3ZBACg==",
);
const endSound = new Audio(
  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77eeeTRAMUKfj8LZjHAY4ktfyy3ksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Ik2CBhnu+3nnk0QDFCn4/C2YxwGOJLX8st5LAUkd8fw3ZBACg==",
);

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [mode, setMode] = React.useState<TimerMode>("pomodoro");
  const [phase, setPhase] = React.useState<PomodoroPhase>("work");
  const [timeLeft, setTimeLeft] = React.useState(WORK_DURATION);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === "pomodoro") {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsedTime((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    endSound.play().catch(() => {});

    if (mode === "pomodoro" && phase === "work" && sessionId) {
      await fetch(`/api/pomodoro/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });

      onSessionComplete?.();
      setSessionId(null);
      setPhase("break");
      setTimeLeft(BREAK_DURATION);
    } else if (mode === "pomodoro" && phase === "break") {
      setPhase("work");
      setTimeLeft(WORK_DURATION);
    }
  };

  const handleStart = async () => {
    if (!isRunning) {
      startSound.play().catch(() => {});

      if (mode === "pomodoro" && phase === "work" && !sessionId) {
        const response = await fetch("/api/pomodoro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "WORK",
            duration: WORK_DURATION / 60,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSessionId(data.id);
        }
      } else if (mode === "elapsed" && !sessionId) {
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
        }
      }
    }

    setIsRunning(!isRunning);
  };

  const handleReset = async () => {
    setIsRunning(false);

    if (mode === "pomodoro") {
      setTimeLeft(phase === "work" ? WORK_DURATION : BREAK_DURATION);
    } else {
      if (sessionId && elapsedTime > 0) {
        const minutes = Math.floor(elapsedTime / 60);
        await fetch(`/api/pomodoro/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completedAt: new Date().toISOString(),
            duration: minutes,
          }),
        });
        onSessionComplete?.();
      }
      setElapsedTime(0);
    }

    setSessionId(null);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);

    if (newMode === "pomodoro") {
      setPhase("work");
      setTimeLeft(WORK_DURATION);
      setElapsedTime(0);
    } else {
      setElapsedTime(0);
      setTimeLeft(0);
    }

    setSessionId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress =
    mode === "pomodoro"
      ? ((phase === "work" ? WORK_DURATION : BREAK_DURATION) - timeLeft) /
        (phase === "work" ? WORK_DURATION : BREAK_DURATION)
      : 0;

  return (
    <Panel
      title="⏱️ Focus Timer"
      subtitle={
        mode === "pomodoro"
          ? phase === "work"
            ? "Work Session"
            : "Break Time"
          : "Elapsed Timer"
      }
    >
      <div className="space-y-6">
        {/* Apple-like Segmented Control */}
        <div className="relative p-1 rounded-[var(--radius-lg)] surface-2 shadow-inner">
          <motion.div
            className="absolute top-1 bottom-1 rounded-[var(--radius)] bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] shadow-lg"
            initial={false}
            animate={{
              left: mode === "pomodoro" ? "4px" : "50%",
              right: mode === "pomodoro" ? "50%" : "4px",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          <div className="relative grid grid-cols-2 gap-1">
            <motion.button
              onClick={() => handleModeChange("pomodoro")}
              className={`relative z-10 px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors ${
                mode === "pomodoro"
                  ? "text-white"
                  : "text-muted hover:text-foreground"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <Timer className="inline h-4 w-4 mr-2" />
              Pomodoro
            </motion.button>

            <motion.button
              onClick={() => handleModeChange("elapsed")}
              className={`relative z-10 px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors ${
                mode === "elapsed"
                  ? "text-white"
                  : "text-muted hover:text-foreground"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <Zap className="inline h-4 w-4 mr-2" />
              Elapsed
            </motion.button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative">
          {/* Circular Progress */}
          <svg className="w-full h-64" viewBox="0 0 200 200">
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="hsl(var(--accent))" />
                <stop offset="100%" stopColor="hsl(var(--accent-secondary))" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="hsl(var(--surface2))"
              strokeWidth="12"
            />

            {/* Progress Circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 80 * (1 - progress),
                filter: isRunning ? "url(#glow)" : "none",
              }}
              transition={{ duration: 0.5 }}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "100px 100px",
              }}
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={mode === "pomodoro" ? timeLeft : elapsedTime}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-bold bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent"
            >
              {formatTime(mode === "pomodoro" ? timeLeft : elapsedTime)}
            </motion.div>

            <AnimatePresence mode="wait">
              {mode === "pomodoro" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2"
                >
                  <GlowBadge variant={phase === "work" ? "accent" : "success"}>
                    {phase === "work" ? (
                      <>
                        <Timer className="inline h-3 w-3 mr-1" />
                        Focus Time
                      </>
                    ) : (
                      <>
                        <Coffee className="inline h-3 w-3 mr-1" />
                        Break Time
                      </>
                    )}
                  </GlowBadge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <motion.button
            onClick={handleStart}
            className={`flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] font-medium shadow-lg transition-all ${
              isRunning
                ? "bg-[hsl(var(--warning))] text-white shadow-[hsl(var(--warning)/0.3)]"
                : "bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] text-white shadow-[hsl(var(--accent)/0.3)]"
            }`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] surface-2 hover:surface-3 font-medium shadow-md transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </motion.button>
        </div>

        {/* Session Info */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center text-sm text-muted overflow-hidden"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨ Session in progress - stay focused!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Panel>
  );
}
