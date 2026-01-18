import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, duration } = await req.json();

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: session.user.id,
        type,
        duration,
      },
    });

    return NextResponse.json(pomodoroSession);
  } catch (error) {
    console.error("Error creating pomodoro session:", error);
    return NextResponse.json(
      { error: "Failed to create pomodoro session" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily";

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "weekly":
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        break;
      case "lifetime":
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Get all work sessions (both completed and in-progress) for the period
    const sessions = await prisma.pomodoroSession.findMany({
      where: {
        userId: session.user.id,
        type: "WORK",
        startedAt: { gte: startDate },
      },
      select: {
        duration: true,
      },
    });

    // Calculate total minutes from all sessions (including in-progress ones)
    const totalMinutes = sessions.reduce(
      (sum, session) => sum + session.duration,
      0,
    );

    return NextResponse.json({
      totalMinutes,
      totalHours: Math.floor(totalMinutes / 60),
      remainingMinutes: totalMinutes % 60,
    });
  } catch (error) {
    console.error("Error fetching pomodoro sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch pomodoro sessions" },
      { status: 500 },
    );
  }
}
