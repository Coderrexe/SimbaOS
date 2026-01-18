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

    const pomodoroSession = await prisma.pomodoroSession.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        completedAt: new Date(),
      },
    });

    return NextResponse.json(pomodoroSession);
  } catch (error) {
    console.error("Error completing pomodoro session:", error);
    return NextResponse.json(
      { error: "Failed to complete pomodoro session" },
      { status: 500 },
    );
  }
}
