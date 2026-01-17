import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [tasks, projects, goals, habits, habitLogs, metrics, reviews] =
      await Promise.all([
        prisma.task.findMany({ where: { userId: session.user.id } }),
        prisma.project.findMany({ where: { userId: session.user.id } }),
        prisma.goal.findMany({ where: { userId: session.user.id } }),
        prisma.habit.findMany({ where: { userId: session.user.id } }),
        prisma.habitLog.findMany({ where: { userId: session.user.id } }),
        prisma.metric.findMany({ where: { userId: session.user.id } }),
        prisma.weeklyReview.findMany({ where: { userId: session.user.id } }),
      ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      data: {
        tasks,
        projects,
        goals,
        habits,
        habitLogs,
        metrics,
        reviews,
      },
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
