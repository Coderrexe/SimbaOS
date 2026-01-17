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
    const type = searchParams.get("type");
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      userId: session.user.id,
      date: { gte: startDate },
    };
    if (type) where.type = type;

    const metrics = await prisma.metric.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Get metrics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const metric = await prisma.metric.create({
      data: {
        ...data,
        userId: session.user.id,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error("Create metric error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
