"use client";

import * as React from "react";
import { Panel } from "./Panel";
import { GlowBadge } from "./GlowBadge";
import { Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

type Period = "daily" | "weekly" | "lifetime";

export function TimeWorkedPanel() {
  const [period, setPeriod] = React.useState<Period>("daily");
  const [stats, setStats] = React.useState({
    totalMinutes: 0,
    totalHours: 0,
    remainingMinutes: 0,
    sessions: [],
  });
  const [loading, setLoading] = React.useState(true);

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pomodoro?period=${period}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Expose refresh function for parent components
  React.useEffect(() => {
    const handleRefresh = () => fetchStats();
    window.addEventListener("pomodoro-complete", handleRefresh);
    return () => window.removeEventListener("pomodoro-complete", handleRefresh);
  }, [fetchStats]);

  const periodLabels = {
    daily: "Today",
    weekly: "This Week",
    lifetime: "All Time",
  };

  return (
    <Panel title="⏱️ Time Worked" subtitle="Track your focused work sessions">
      <div className="space-y-4">
        {/* Period Selector */}
        <div className="flex gap-2">
          {(["daily", "weekly", "lifetime"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-all ${
                period === p
                  ? "bg-[hsl(var(--accent))] text-white"
                  : "surface-2 hover:surface-3"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        {/* Stats Display */}
        {loading ? (
          <div className="text-center py-8 text-muted">
            <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Loading...</p>
          </div>
        ) : (
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Time Display */}
            <div className="text-center p-6 rounded-[var(--radius-lg)] surface-2">
              <div className="text-5xl font-bold mb-2 tabular-nums">
                {stats.totalHours}
                <span className="text-2xl text-muted">h</span>{" "}
                {stats.remainingMinutes}
                <span className="text-2xl text-muted">m</span>
              </div>
              <p className="text-sm text-muted">
                {stats.sessions.length}{" "}
                {stats.sessions.length === 1 ? "session" : "sessions"}
              </p>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[var(--radius)] surface-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-[hsl(var(--accent))]" />
                  <span className="text-xs text-muted">Avg/Session</span>
                </div>
                <div className="text-lg font-semibold">
                  {stats.sessions.length > 0
                    ? Math.round(stats.totalMinutes / stats.sessions.length)
                    : 0}
                  m
                </div>
              </div>

              <div className="p-3 rounded-[var(--radius)] surface-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />
                  <span className="text-xs text-muted">Sessions</span>
                </div>
                <div className="text-lg font-semibold">
                  {stats.sessions.length}
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            {stats.totalHours === 0 && stats.remainingMinutes === 0 ? (
              <div className="text-center py-4 text-muted text-sm">
                <p>Start a Pomodoro session to begin tracking!</p>
              </div>
            ) : (
              <div className="text-center py-2">
                <GlowBadge variant="success">
                  {period === "daily" &&
                    stats.totalHours >= 4 &&
                    "🔥 Great focus today!"}
                  {period === "daily" &&
                    stats.totalHours < 4 &&
                    stats.totalHours > 0 &&
                    "Keep going!"}
                  {period === "weekly" &&
                    stats.totalHours >= 20 &&
                    "🚀 Crushing it this week!"}
                  {period === "weekly" &&
                    stats.totalHours < 20 &&
                    stats.totalHours > 0 &&
                    "Building momentum!"}
                  {period === "lifetime" &&
                    stats.totalHours >= 100 &&
                    "⭐ Century club!"}
                  {period === "lifetime" &&
                    stats.totalHours < 100 &&
                    stats.totalHours > 0 &&
                    "Every hour counts!"}
                </GlowBadge>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Panel>
  );
}
