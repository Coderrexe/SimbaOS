"use client";

import * as React from "react";
import { Panel } from "./Panel";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

type Period = "daily" | "weekly" | "lifetime";

export function TimeWorkedPanel() {
  const [period, setPeriod] = React.useState<Period>("daily");
  const [stats, setStats] = React.useState({
    totalMinutes: 0,
    totalHours: 0,
    remainingMinutes: 0,
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

  // Live polling every 10 seconds to show real-time updates
  React.useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchStats();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
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
              <p className="text-sm text-muted">Total focused work time</p>
            </div>
          </motion.div>
        )}
      </div>
    </Panel>
  );
}
