import { Task, HabitLog, Metric } from "@prisma/client";
import { differenceInDays, startOfWeek, endOfWeek } from "date-fns";

export interface PrioritizedTask extends Task {
  priorityScore: number;
}

export function calculateTaskPriority(task: Task): number {
  const now = new Date();

  let score = 0;

  score += task.impact * 20;
  score += task.priority * 10;

  if (task.dueDate) {
    const daysUntilDue = differenceInDays(task.dueDate, now);
    if (daysUntilDue < 0) {
      score += 100;
    } else if (daysUntilDue === 0) {
      score += 80;
    } else if (daysUntilDue === 1) {
      score += 60;
    } else if (daysUntilDue <= 3) {
      score += 40;
    } else if (daysUntilDue <= 7) {
      score += 20;
    }
  }

  if (task.estimatedMinutes) {
    if (task.estimatedMinutes <= 15) {
      score += 15;
    } else if (task.estimatedMinutes <= 30) {
      score += 10;
    } else if (task.estimatedMinutes <= 60) {
      score += 5;
    }
  }

  if (task.projectId) {
    score += 15;
  }

  score += task.stagnationDays * 5;

  return score;
}

export function prioritizeTasks(tasks: Task[]): PrioritizedTask[] {
  return tasks
    .map((task) => ({
      ...task,
      priorityScore: calculateTaskPriority(task),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export interface MomentumScoreConfig {
  deepWorkWeight: number;
  outputWeight: number;
  sleepPenaltyThreshold: number;
  sleepPenaltyWeight: number;
  exerciseBonus: number;
}

export const DEFAULT_MOMENTUM_CONFIG: MomentumScoreConfig = {
  deepWorkWeight: 30,
  outputWeight: 25,
  sleepPenaltyThreshold: 7,
  sleepPenaltyWeight: 20,
  exerciseBonus: 15,
};

export interface MomentumScoreResult {
  score: number;
  breakdown: {
    deepWorkScore: number;
    outputScore: number;
    sleepScore: number;
    exerciseScore: number;
  };
  metrics: {
    deepWorkHours: number;
    outputCount: number;
    sleepAverage: number;
    exerciseSessions: number;
  };
}

export function calculateFounderMomentumScore(
  metrics: Metric[],
  config: MomentumScoreConfig = DEFAULT_MOMENTUM_CONFIG,
): MomentumScoreResult {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const weekMetrics = metrics.filter((m) => {
    const date = new Date(m.date);
    return date >= weekStart && date <= weekEnd;
  });

  const deepWorkHours = weekMetrics
    .filter((m) => m.type === "DEEP_WORK_HOURS")
    .reduce((sum, m) => sum + m.value, 0);

  const outputCount = weekMetrics
    .filter((m) => m.type === "OUTPUT_SHIPPED")
    .reduce((sum, m) => sum + m.value, 0);

  const sleepLogs = weekMetrics.filter((m) => m.type === "SLEEP_AVERAGE");
  const sleepAverage =
    sleepLogs.length > 0
      ? sleepLogs.reduce((sum, m) => sum + m.value, 0) / sleepLogs.length
      : 0;

  const exerciseSessions = weekMetrics
    .filter((m) => m.type === "FITNESS_SESSIONS")
    .reduce((sum, m) => sum + m.value, 0);

  const deepWorkScore =
    Math.min(100, (deepWorkHours / 20) * 100) * (config.deepWorkWeight / 100);
  const outputScore =
    Math.min(100, (outputCount / 5) * 100) * (config.outputWeight / 100);

  let sleepScore = 0;
  if (sleepAverage < config.sleepPenaltyThreshold) {
    const deficit = config.sleepPenaltyThreshold - sleepAverage;
    sleepScore = -deficit * config.sleepPenaltyWeight;
  }

  const exerciseScore = Math.min(config.exerciseBonus, exerciseSessions * 3);

  const totalScore = Math.max(
    0,
    Math.min(100, deepWorkScore + outputScore + sleepScore + exerciseScore),
  );

  return {
    score: Math.round(totalScore),
    breakdown: {
      deepWorkScore: Math.round(deepWorkScore),
      outputScore: Math.round(outputScore),
      sleepScore: Math.round(sleepScore),
      exerciseScore: Math.round(exerciseScore),
    },
    metrics: {
      deepWorkHours,
      outputCount,
      sleepAverage,
      exerciseSessions,
    },
  };
}

export function getOneThing(tasks: PrioritizedTask[]): PrioritizedTask | null {
  const highImpactTasks = tasks.filter(
    (t) => t.impact >= 4 && t.status !== "DONE" && t.status !== "WAITING",
  );

  if (highImpactTasks.length === 0) {
    return tasks[0] || null;
  }

  return highImpactTasks[0];
}

export interface Alert {
  id: string;
  type: "overdue" | "stagnating" | "habit_risk" | "sleep_debt" | "deadline";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  actionUrl?: string;
}

export function generateAlerts(
  tasks: Task[],
  habitLogs: HabitLog[],
  metrics: Metric[],
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== "DONE",
  );

  if (overdueTasks.length > 0) {
    alerts.push({
      id: "overdue-tasks",
      type: "overdue",
      severity: "high",
      title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`,
      description: `You have ${overdueTasks.length} task${overdueTasks.length > 1 ? "s" : ""} past their due date`,
      actionUrl: "/tasks?filter=overdue",
    });
  }

  const stagnatingTasks = tasks.filter(
    (t) =>
      t.stagnationDays > 7 && t.status !== "DONE" && t.status !== "WAITING",
  );

  if (stagnatingTasks.length > 0) {
    alerts.push({
      id: "stagnating-tasks",
      type: "stagnating",
      severity: "medium",
      title: `${stagnatingTasks.length} stagnating task${stagnatingTasks.length > 1 ? "s" : ""}`,
      description: `Tasks untouched for over a week`,
      actionUrl: "/tasks",
    });
  }

  const recentSleep = metrics
    .filter((m) => m.type === "SLEEP_AVERAGE")
    .slice(-7);

  if (recentSleep.length >= 3) {
    const avgSleep =
      recentSleep.reduce((sum, m) => sum + m.value, 0) / recentSleep.length;
    if (avgSleep < 6.5) {
      alerts.push({
        id: "sleep-debt",
        type: "sleep_debt",
        severity: "high",
        title: "Sleep debt accumulating",
        description: `Average ${avgSleep.toFixed(1)}h/night - below healthy threshold`,
        actionUrl: "/habits",
      });
    }
  }

  return alerts;
}
