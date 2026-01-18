import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CommandPageClient } from "./CommandPageClient";

async function getCommandData(userId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const today = new Date(now.setHours(0, 0, 0, 0));
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [
    topTasks,
    metrics,
    todayTasks,
    nextActions,
    projects,
    inboxItems,
    staleProjects,
    overdueTasks,
    habits,
    allTasks,
  ] = await Promise.all([
    // Top priority tasks
    prisma.task.findMany({
      where: {
        userId,
        status: { in: ["TODO", "IN_PROGRESS"] },
        OR: [{ priority: { gte: 4 } }, { impact: { gte: 4 } }],
      },
      orderBy: [{ priority: "desc" }, { impact: "desc" }],
      take: 3,
      include: { project: true },
    }),

    // Metrics for trajectory
    prisma.metric.findMany({
      where: {
        userId,
        date: { gte: weekAgo },
      },
      orderBy: { date: "asc" },
    }),

    // Today's tasks
    prisma.task.findMany({
      where: {
        userId,
        status: { in: ["TODO", "IN_PROGRESS"] },
        OR: [
          { dueDate: { gte: today, lt: tomorrow } },
          { status: "IN_PROGRESS" },
        ],
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),

    // Next actions
    prisma.task.findMany({
      where: {
        userId,
        status: "TODO",
        priority: { gte: 3 },
      },
      orderBy: [{ priority: "desc" }, { impact: "desc" }],
      take: 5,
    }),

    // Active projects
    prisma.project.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        tasks: {
          where: { status: { not: "DONE" } },
        },
      },
      take: 5,
    }),

    // Inbox items
    prisma.task.findMany({
      where: {
        userId,
        status: "INBOX",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Stale projects
    prisma.project.findMany({
      where: {
        userId,
        status: "ACTIVE",
        updatedAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
      take: 3,
    }),

    // Overdue tasks
    prisma.task.findMany({
      where: {
        userId,
        status: { in: ["TODO", "IN_PROGRESS"] },
        dueDate: { lt: today },
        priority: { gte: 3 },
      },
      take: 3,
    }),

    // Habits
    prisma.habit.findMany({
      where: { userId },
      include: {
        logs: {
          where: { date: { gte: weekAgo } },
          orderBy: { date: "desc" },
        },
      },
    }),

    // All active tasks for task management panel
    prisma.task.findMany({
      where: {
        userId,
        status: { in: ["TODO", "IN_PROGRESS", "INBOX"] },
      },
      include: { project: true },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    }),
  ]);

  return {
    topTasks,
    metrics,
    todayTasks,
    nextActions,
    projects,
    inboxItems,
    staleProjects,
    overdueTasks,
    habits,
    allTasks,
  };
}

export default async function CommandPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const data = await getCommandData(session.user.id);

  return <CommandPageClient data={data} />;
}
