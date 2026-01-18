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

    const data = await req.json();

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Fix timezone issue: parse date as local date at noon to avoid day shift
    let dueDate = undefined;
    if (data.dueDate !== undefined) {
      if (data.dueDate === null) {
        dueDate = null;
      } else {
        const [year, month, day] = data.dueDate.split("-").map(Number);
        dueDate = new Date(year, month - 1, day, 12, 0, 0);
      }
    }

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...data,
        dueDate,
        completedAt:
          data.status === "DONE" && !task.completedAt
            ? new Date()
            : data.status !== "DONE"
              ? null
              : undefined,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
