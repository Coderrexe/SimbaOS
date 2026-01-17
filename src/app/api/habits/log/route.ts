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

    const data = await req.json();

    const habit = await prisma.habit.findUnique({
      where: { id: data.habitId },
    });

    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const log = await prisma.habitLog.create({
      data: {
        habitId: data.habitId,
        userId: session.user.id,
        date: data.date ? new Date(data.date) : new Date(),
        value: data.value,
        notes: data.notes,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Create habit log error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
