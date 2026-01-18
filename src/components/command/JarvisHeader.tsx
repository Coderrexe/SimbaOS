"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  Zap,
  Calendar,
  CheckSquare,
  Timer,
} from "lucide-react";

interface JarvisHeaderProps {
  userName?: string;
  activeTasksCount: number;
  todayFocusMinutes: number;
}

export function JarvisHeader({
  userName = "Simba",
  activeTasksCount,
  todayFocusMinutes,
}: JarvisHeaderProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [weather, setWeather] = React.useState<{
    temp: number;
    condition: string;
    emoji: string;
  } | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    // Fetch weather data (using a free API like wttr.in)
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
        // Fallback weather
        setWeather({ temp: 22, condition: "Clear", emoji: "☀️" });
      });
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Systems online. Ready to dominate the day.",
      "All systems operational. Let's make it count.",
      "Power levels optimal. Time to execute.",
      "Ready when you are, sir.",
      "Standing by for your command.",
      "Diagnostics complete. You're all set.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
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
      className="relative overflow-hidden rounded-[var(--radius-lg)] p-4 mb-6"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--surface1)) 0%, hsl(var(--surface2)) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid hsl(var(--border))",
        boxShadow: "0 8px 32px hsl(var(--shadow) / 0.1)",
      }}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-30">
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

      <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Greeting and Message */}
        <div className="flex-1 min-w-[300px]">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold mb-1"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent-secondary)) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {getGreeting()}, {userName}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted"
          >
            {getMotivationalMessage()}
          </motion.p>
        </div>

        {/* Right: Stats Grid */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4 flex-wrap"
        >
          {/* Date */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] surface-2">
            <Calendar className="h-4 w-4 text-[hsl(var(--accent))]" />
            <span className="text-sm font-medium">{formatDate()}</span>
          </div>

          {/* Weather */}
          {weather && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] surface-2">
              <span className="text-lg">{weather.emoji}</span>
              <span className="text-sm font-medium">{weather.temp}°C</span>
            </div>
          )}

          {/* Active Tasks */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] surface-2">
            <CheckSquare className="h-4 w-4 text-[hsl(var(--accent))]" />
            <span className="text-sm font-medium">
              {activeTasksCount} tasks
            </span>
          </div>

          {/* Focus Time */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] surface-2">
            <Timer className="h-4 w-4 text-[hsl(var(--accent))]" />
            <span className="text-sm font-medium">
              {focusHours > 0 ? `${focusHours}h ` : ""}
              {focusMins}m today
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
