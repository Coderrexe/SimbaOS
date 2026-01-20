"use client";

import * as React from "react";

export type Mode = "plan" | "execute" | "reflect";

export interface Selection {
  type: "task" | "project" | "goal" | "habit" | "person" | null;
  id: string | null;
}

interface CommandContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  selection: Selection;
  setSelection: (selection: Selection) => void;
  showRightNow: boolean;
  setShowRightNow: (show: boolean) => void;
  focusTimer: {
    active: boolean;
    taskId: string | null;
    startTime: number | null;
    duration: number;
  };
  startFocus: (taskId: string, duration: number) => void;
  stopFocus: () => void;
  // Shared Pomodoro timer state
  sharedTimer: {
    isRunning: boolean;
    timeLeft: number;
    sessionId: string | null;
    phase: "work" | "break";
  };
  setSharedTimer: (timer: {
    isRunning: boolean;
    timeLeft: number;
    sessionId: string | null;
    phase: "work" | "break";
  }) => void;
}

const CommandContext = React.createContext<CommandContextValue | undefined>(
  undefined,
);

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<Mode>("plan");
  const [selection, setSelection] = React.useState<Selection>({
    type: null,
    id: null,
  });
  const [showRightNow, setShowRightNow] = React.useState(false);
  const [focusTimer, setFocusTimer] = React.useState({
    active: false,
    taskId: null as string | null,
    startTime: null as number | null,
    duration: 25,
  });
  const [sharedTimer, setSharedTimer] = React.useState({
    isRunning: false,
    timeLeft: 25 * 60,
    sessionId: null as string | null,
    phase: "work" as "work" | "break",
  });

  // Persist mode to localStorage
  React.useEffect(() => {
    const savedMode = localStorage.getItem("simbaos-mode");
    if (savedMode && ["plan", "execute", "reflect"].includes(savedMode)) {
      setModeState(savedMode as Mode);
    }
  }, []);

  const setMode = React.useCallback((newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("simbaos-mode", newMode);
  }, []);

  const startFocus = React.useCallback((taskId: string, duration: number) => {
    setFocusTimer({
      active: true,
      taskId,
      startTime: Date.now(),
      duration,
    });
  }, []);

  const stopFocus = React.useCallback(() => {
    setFocusTimer({
      active: false,
      taskId: null,
      startTime: null,
      duration: 25,
    });
  }, []);

  return (
    <CommandContext.Provider
      value={{
        mode,
        setMode,
        selection,
        setSelection,
        showRightNow,
        setShowRightNow,
        focusTimer,
        startFocus,
        stopFocus,
        sharedTimer,
        setSharedTimer,
      }}
    >
      {children}
    </CommandContext.Provider>
  );
}

export function useCommand() {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error("useCommand must be used within CommandProvider");
  }
  return context;
}
