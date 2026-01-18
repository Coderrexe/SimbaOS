"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, Timer } from "lucide-react";

interface JarvisHeaderProps {
  userName?: string;
  activeTasksCount: number;
  todayFocusMinutes: number;
}

export function JarvisHeader({
  userName = "Simba",
  activeTasksCount,
  todayFocusMinutes: initialFocusMinutes,
}: JarvisHeaderProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [todayFocusMinutes, setTodayFocusMinutes] =
    React.useState(initialFocusMinutes);
  const [motivationalMessage, setMotivationalMessage] = React.useState(
    "Systems online. Ready to dominate the day.",
  );
  const [weather, setWeather] = React.useState<{
    temp: number;
    condition: string;
    emoji: string;
  }>({ temp: 22, condition: "Clear", emoji: "☀️" }); // Initialize with default to prevent layout shift

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live focus time updates
  const fetchFocusTime = React.useCallback(async () => {
    try {
      const response = await fetch("/api/pomodoro?period=daily");
      const data = await response.json();
      setTodayFocusMinutes(data.totalMinutes);
    } catch (error) {
      console.error("Error fetching focus time:", error);
    }
  }, []);

  // Poll for updates every 10 seconds
  React.useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchFocusTime();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [fetchFocusTime]);

  // Listen for pomodoro completion events
  React.useEffect(() => {
    const handleRefresh = () => fetchFocusTime();
    window.addEventListener("pomodoro-complete", handleRefresh);
    return () => window.removeEventListener("pomodoro-complete", handleRefresh);
  }, [fetchFocusTime]);

  React.useEffect(() => {
    // Set random message after mount to avoid hydration mismatch
    const messages = [
      "Systems online. Ready to dominate the day.",
      "All systems operational. Let's make it count.",
      "Power levels optimal. Time to execute.",
      "Ready when you are, sir.",
      "Standing by for your command.",
      "Diagnostics complete. You're all set.",
    ];
    setMotivationalMessage(
      messages[Math.floor(Math.random() * messages.length)],
    );
  }, []);

  React.useEffect(() => {
    fetch("https://wttr.in/?format=j1")
      .then((res) => res.json())
      .then((data) => {
        const current = data.current_condition[0];
        const temp = Math.round(current.temp_C);
        const condition = current.weatherDesc[0].value.toLowerCase();

        let emoji = "☀️";
        if (condition.includes("rain") || condition.includes("drizzle"))
          emoji = "🌧️";
        else if (condition.includes("cloud") || condition.includes("overcast"))
          emoji = "☁️";
        else if (condition.includes("snow")) emoji = "❄️";
        else if (condition.includes("clear") || condition.includes("sunny"))
          emoji = "☀️";
        else if (condition.includes("thunder")) emoji = "⛈️";
        else if (condition.includes("fog") || condition.includes("mist"))
          emoji = "🌫️";

        setWeather({ temp, condition, emoji });
      })
      .catch(() => {
        // Keep default weather on error
      });
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const focusHours = Math.floor(todayFocusMinutes / 60);
  const focusMins = todayFocusMinutes % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[var(--radius-lg)] px-4 py-3 mb-6 min-h-[80px]"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--surface1)) 0%, hsl(var(--surface2)) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid hsl(var(--border))",
        boxShadow: "0 8px 32px hsl(var(--shadow) / 0.1)",
      }}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-32 h-32 bg-[hsl(var(--accent))] rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Top: Greeting - Using regular color instead of gradient for better visibility */}
        <h1 className="text-xl font-bold text-[hsl(var(--accent))]">
          {getGreeting()}, {userName}
        </h1>

        {/* Bottom: Message and Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <p className="text-sm text-muted">{motivationalMessage}</p>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] surface-2 whitespace-nowrap text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(var(--accent))]" />
              <span className="font-medium hidden sm:inline">
                {formatDate()}
              </span>
              <span className="font-medium sm:hidden">
                {currentTime.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] surface-2 whitespace-nowrap text-xs sm:text-sm">
              <span className="text-base sm:text-lg">{weather.emoji}</span>
              <span className="font-medium">{weather.temp}°C</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] surface-2 whitespace-nowrap text-xs sm:text-sm">
              <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(var(--accent))]" />
              <span className="font-medium">{activeTasksCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] surface-2 whitespace-nowrap text-xs sm:text-sm">
              <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(var(--accent))]" />
              <span className="font-medium">
                {focusHours > 0 ? `${focusHours}h ` : ""}
                {focusMins}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
