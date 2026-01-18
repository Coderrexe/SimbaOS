import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updateData: any = {};

    // Update duration if provided
    if (body.duration !== undefined) {
      updateData.duration = body.duration;
    }

    // Update completedAt if provided (null keeps it open, date completes it)
    if (body.completedAt !== undefined) {
      updateData.completedAt = body.completedAt
        ? new Date(body.completedAt)
        : null;
    }

    const pomodoroSession = await prisma.pomodoroSession.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json(pomodoroSession);
  } catch (error) {
    console.error("Error updating pomodoro session:", error);
    return NextResponse.json(
      { error: "Failed to update pomodoro session" },
      { status: 500 },
    );
  }
}
