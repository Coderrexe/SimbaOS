import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetPomodoroTime() {
  try {
    console.log("Resetting all pomodoro session data...");

    const result = await prisma.pomodoroSession.deleteMany({});

    console.log(`Successfully deleted ${result.count} pomodoro sessions`);
    console.log("All time worked data has been reset to 0");
    console.log(
      "Timer functionality remains intact - new sessions will be created when you start a timer",
    );
  } catch (error) {
    console.error("Error resetting pomodoro data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPomodoroTime();
