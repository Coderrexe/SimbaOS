import {
  calculateTaskPriority,
  calculateFounderMomentumScore,
  DEFAULT_MOMENTUM_CONFIG,
} from "../src/lib/algorithms";
import { Task, Metric } from "@prisma/client";

describe("Task Prioritization Algorithm", () => {
  const baseTask: Task = {
    id: "1",
    userId: "user1",
    title: "Test Task",
    notes: null,
    dueDate: null,
    estimatedMinutes: null,
    priority: 3,
    impact: 3,
    energyLevel: "MEDIUM",
    context: "COMPUTER",
    status: "TODO",
    projectId: null,
    stagnationDays: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
  };

  it("should prioritize overdue tasks highest", () => {
    const overdueTask = {
      ...baseTask,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    };
    const futureTask = {
      ...baseTask,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    const overdueScore = calculateTaskPriority(overdueTask);
    const futureScore = calculateTaskPriority(futureTask);

    expect(overdueScore).toBeGreaterThan(futureScore);
  });

  it("should boost priority for high-impact tasks", () => {
    const highImpact = { ...baseTask, impact: 5 };
    const lowImpact = { ...baseTask, impact: 1 };

    const highScore = calculateTaskPriority(highImpact);
    const lowScore = calculateTaskPriority(lowImpact);

    expect(highScore).toBeGreaterThan(lowScore);
  });

  it("should favor quick wins (short tasks)", () => {
    const quickTask = { ...baseTask, estimatedMinutes: 15 };
    const longTask = { ...baseTask, estimatedMinutes: 120 };

    const quickScore = calculateTaskPriority(quickTask);
    const longScore = calculateTaskPriority(longTask);

    expect(quickScore).toBeGreaterThan(longScore);
  });

  it("should penalize stagnating tasks", () => {
    const stagnantTask = { ...baseTask, stagnationDays: 10 };
    const freshTask = { ...baseTask, stagnationDays: 0 };

    const stagnantScore = calculateTaskPriority(stagnantTask);
    const freshScore = calculateTaskPriority(freshTask);

    expect(stagnantScore).toBeGreaterThan(freshScore);
  });

  it("should boost tasks linked to projects", () => {
    const projectTask = { ...baseTask, projectId: "project1" };
    const standaloneTask = { ...baseTask, projectId: null };

    const projectScore = calculateTaskPriority(projectTask);
    const standaloneScore = calculateTaskPriority(standaloneTask);

    expect(projectScore).toBeGreaterThan(standaloneScore);
  });
});

describe("Founder Momentum Score", () => {
  const baseMetric: Omit<Metric, "id" | "createdAt"> = {
    userId: "user1",
    date: new Date(),
    type: "DEEP_WORK_HOURS",
    value: 0,
  };

  it("should calculate score based on deep work hours", () => {
    const metrics: Metric[] = [
      {
        ...baseMetric,
        id: "1",
        type: "DEEP_WORK_HOURS",
        value: 20,
        createdAt: new Date(),
      },
    ];

    const result = calculateFounderMomentumScore(metrics);

    expect(result.score).toBeGreaterThan(0);
    expect(result.metrics.deepWorkHours).toBe(20);
  });

  it("should penalize insufficient sleep", () => {
    const goodSleep: Metric[] = [
      {
        ...baseMetric,
        id: "1",
        type: "SLEEP_AVERAGE",
        value: 8,
        createdAt: new Date(),
      },
      {
        ...baseMetric,
        id: "2",
        type: "DEEP_WORK_HOURS",
        value: 10,
        createdAt: new Date(),
      },
    ];

    const badSleep: Metric[] = [
      {
        ...baseMetric,
        id: "1",
        type: "SLEEP_AVERAGE",
        value: 5,
        createdAt: new Date(),
      },
      {
        ...baseMetric,
        id: "2",
        type: "DEEP_WORK_HOURS",
        value: 10,
        createdAt: new Date(),
      },
    ];

    const goodResult = calculateFounderMomentumScore(goodSleep);
    const badResult = calculateFounderMomentumScore(badSleep);

    expect(goodResult.score).toBeGreaterThan(badResult.score);
  });

  it("should reward output shipped", () => {
    const withOutput: Metric[] = [
      {
        ...baseMetric,
        id: "1",
        type: "OUTPUT_SHIPPED",
        value: 5,
        createdAt: new Date(),
      },
    ];

    const withoutOutput: Metric[] = [];

    const withResult = calculateFounderMomentumScore(withOutput);
    const withoutResult = calculateFounderMomentumScore(withoutOutput);

    expect(withResult.score).toBeGreaterThan(withoutResult.score);
  });

  it("should cap score at 100", () => {
    const maxMetrics: Metric[] = [
      {
        ...baseMetric,
        id: "1",
        type: "DEEP_WORK_HOURS",
        value: 100,
        createdAt: new Date(),
      },
      {
        ...baseMetric,
        id: "2",
        type: "OUTPUT_SHIPPED",
        value: 100,
        createdAt: new Date(),
      },
      {
        ...baseMetric,
        id: "3",
        type: "SLEEP_AVERAGE",
        value: 9,
        createdAt: new Date(),
      },
      {
        ...baseMetric,
        id: "4",
        type: "FITNESS_SESSIONS",
        value: 20,
        createdAt: new Date(),
      },
    ];

    const result = calculateFounderMomentumScore(maxMetrics);

    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should provide detailed breakdown", () => {
    const metrics: Metric[] = [
      {
        ...baseMetric,
        id: "1",
        type: "DEEP_WORK_HOURS",
        value: 15,
        createdAt: new Date(),
      },
      {
        ...baseMetric,
        id: "2",
        type: "OUTPUT_SHIPPED",
        value: 3,
        createdAt: new Date(),
      },
    ];

    const result = calculateFounderMomentumScore(metrics);

    expect(result.breakdown).toHaveProperty("deepWorkScore");
    expect(result.breakdown).toHaveProperty("outputScore");
    expect(result.breakdown).toHaveProperty("sleepScore");
    expect(result.breakdown).toHaveProperty("exerciseScore");
  });
});
