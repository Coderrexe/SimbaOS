import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  prioritizeTasks,
  generateAlerts,
  getOneThing,
  calculateFounderMomentumScore,
} from "@/lib/algorithms";
import { startOfWeek, endOfWeek, startOfDay, addDays } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const [tasks, habitLogs, metrics, weeklyGoals] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId: session.user.id,
          status: { notIn: ["DONE"] },
        },
        include: { project: true },
      }),
      prisma.habitLog.findMany({
        where: {
          userId: session.user.id,
          date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.metric.findMany({
        where: {
          userId: session.user.id,
          date: { gte: weekStart },
        },
      }),
      prisma.goal.findMany({
        where: {
          userId: session.user.id,
          type: "WEEKLY",
          status: "ACTIVE",
        },
      }),
    ]);

    const prioritized = prioritizeTasks(tasks);
    const nextActions = prioritized.slice(0, 10);
    const oneThing = getOneThing(prioritized);
    const alerts = generateAlerts(tasks, habitLogs, metrics);
    const momentumScore = calculateFounderMomentumScore(metrics);

    const todayTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        startOfDay(new Date(t.dueDate)).getTime() === today.getTime(),
    );

    const upcomingTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = startOfDay(new Date(t.dueDate));
      return dueDate > today && dueDate <= addDays(today, 2);
    });

    return NextResponse.json({
      nextActions,
      oneThing,
      alerts,
      momentumScore,
      todayTasks,
      upcomingTasks,
      weeklyGoals,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
