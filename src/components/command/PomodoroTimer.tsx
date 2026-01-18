"use client";

import * as React from "react";
import { Panel } from "./Panel";
import { GlowBadge } from "./GlowBadge";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = React.useState(false);
  const [isBreak, setIsBreak] = React.useState(false);
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(
    null,
  );

  const startSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const endSoundRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    // Create audio elements for sound effects
    startSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OeeSwwMUKbk77RgGwU7k9jyz3wuBSh+zPLaizsKGGS56+mjUBELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGS56+mjUBELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGS56+mjUBELTKXh8bllHAU2jdXzzn0vBQ==",
    );
    endSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OeeSwwMUKbk77RgGwU7k9jyz3wuBSh+zPLaizsKGGS56+mjUBELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGS56+mjUBELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGS56+mjUBELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGS56+mjUBELTKXh8bllHAU2jdXzzn0vBQ==",
    );
  }, []);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);

    // Play end sound
    if (endSoundRef.current) {
      endSoundRef.current.play().catch(console.error);
    }

    // Complete the session in database
    if (currentSessionId && !isBreak) {
      try {
        await fetch(`/api/pomodoro/${currentSessionId}`, {
          method: "PATCH",
        });
        onSessionComplete?.();
      } catch (error) {
        console.error("Error completing session:", error);
      }
    }

    // Switch between work and break
    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(25 * 60); // 25 minutes work
    } else {
      setIsBreak(true);
      setTimeLeft(5 * 60); // 5 minutes break
    }
  };

  const handleStart = async () => {
    if (!isRunning) {
      // Play start sound
      if (startSoundRef.current) {
        startSoundRef.current.play().catch(console.error);
      }

      // Create session in database if it's a work session
      if (!isBreak) {
        try {
          const response = await fetch("/api/pomodoro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "WORK",
              duration: 25,
            }),
          });
          const data = await response.json();
          setCurrentSessionId(data.id);
        } catch (error) {
          console.error("Error creating session:", error);
        }
      }
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
    setCurrentSessionId(null);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Panel
      title={isBreak ? "☕ Break Time" : "🍅 Pomodoro Timer"}
      subtitle={isBreak ? "Relax and recharge" : "Focus on deep work"}
    >
      <div className="flex flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={isBreak ? "break" : "work"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center mb-6"
          >
            <div className="text-6xl font-bold mb-2 tabular-nums">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </div>
            <GlowBadge variant={isBreak ? "success" : "accent"}>
              {isBreak ? "Break" : "Focus"}
            </GlowBadge>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] bg-[hsl(var(--accent))] text-white hover:opacity-90 transition-all lift-on-hover"
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
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] surface-2 hover:surface-3 transition-all"
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </button>
        </div>

        <div className="mt-6 text-xs text-muted text-center">
          <p>25 min work → 5 min break → repeat</p>
          <p className="mt-1">All work sessions are tracked automatically</p>
        </div>
      </div>
    </Panel>
  );
}
