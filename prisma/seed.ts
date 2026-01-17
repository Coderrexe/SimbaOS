import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("demo123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@simbaos.com" },
    update: {},
    create: {
      email: "demo@simbaos.com",
      name: "Simba",
      password,
    },
  });

  console.log("Created demo user:", user.email);

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: "Build SimbaOS",
      mission: "Create the best personal dashboard for founders",
      desiredOutcome: "A production-ready app with all core features",
      status: "ACTIVE",
      weeklyGoal: "Complete MVP and deploy",
    },
  });

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        projectId: project.id,
        title: "Review weekly metrics",
        priority: 4,
        impact: 5,
        energyLevel: "MEDIUM",
        context: "COMPUTER",
        status: "TODO",
        estimatedMinutes: 30,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        title: "Deep work session on research",
        priority: 5,
        impact: 5,
        energyLevel: "HIGH",
        context: "COMPUTER",
        status: "TODO",
        estimatedMinutes: 120,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        title: "Quick email responses",
        priority: 2,
        impact: 2,
        energyLevel: "LOW",
        context: "PHONE",
        status: "TODO",
        estimatedMinutes: 15,
      },
    ],
  });

  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: "Become a world-class tech founder",
        description: "Build companies that matter and create lasting impact",
        type: "NORTH_STAR",
        status: "ACTIVE",
      },
      {
        userId: user.id,
        title: "Launch MVP this quarter",
        description: "Ship first version of product to users",
        type: "QUARTERLY",
        status: "ACTIVE",
        progress: 60,
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        title: "Complete 20 hours of deep work",
        description: "Focus time on high-leverage activities",
        type: "WEEKLY",
        status: "ACTIVE",
        progress: 45,
      },
    ],
  });

  await prisma.habit.createMany({
    data: [
      {
        userId: user.id,
        name: "Sleep",
        type: "SLEEP",
        targetFrequency: 7,
        unit: "hours",
      },
      {
        userId: user.id,
        name: "Exercise",
        type: "EXERCISE",
        targetFrequency: 5,
        unit: "sessions",
      },
      {
        userId: user.id,
        name: "Deep Work",
        type: "DEEP_WORK",
        targetFrequency: 5,
        unit: "hours",
      },
    ],
  });

  const today = new Date();
  await prisma.metric.createMany({
    data: [
      {
        userId: user.id,
        type: "DEEP_WORK_HOURS",
        value: 4,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        type: "DEEP_WORK_HOURS",
        value: 6,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        type: "OUTPUT_SHIPPED",
        value: 2,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        type: "SLEEP_AVERAGE",
        value: 7.5,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        type: "FITNESS_SESSIONS",
        value: 1,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
