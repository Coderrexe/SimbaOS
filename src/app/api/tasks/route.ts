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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");

    const where: any = { userId: session.user.id };
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.error("No user ID in session:", session);
      return NextResponse.json(
        { error: "Unauthorized - Please sign in again" },
        { status: 401 },
      );
    }

    const data = await req.json();

    console.log("Creating task with userId:", session.user.id);

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json(
        {
          error: "User not found - Please sign out and sign in again",
        },
        { status: 400 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        notes: data.notes || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || 3,
        impact: data.impact || 3,
        energyLevel: data.energyLevel || "MEDIUM",
        context: data.context || "COMPUTER",
        status: data.status || "TODO",
        estimatedMinutes: data.estimatedMinutes || null,
        projectId: data.projectId || null,
        userId: session.user.id,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create task: " + (error as Error).message },
      { status: 500 },
    );
  }
}
