import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Panel } from "@/components/command/Panel";
import { GlowBadge } from "@/components/command/GlowBadge";
import { StreakDots } from "@/components/command/MicroChart";

async function getHabitsData(userId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: { date: { gte: weekAgo } },
        orderBy: { date: "desc" },
      },
    },
  });

  return { habits };
}

export default async function HabitsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { habits } = await getHabitsData(session.user.id);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Habits</h1>
          <p className="text-muted">
            Track your daily habits and build streaks
          </p>
        </div>

        <Panel title={`Your Habits (${habits.length})`}>
          {habits.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="mb-4">No habits tracked yet</p>
              <p className="text-sm text-subtle">
                Start tracking habits to build consistency
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dateStr = date.toISOString().split("T")[0];
                  return habit.logs.some(
                    (log) => log.date.toISOString().split("T")[0] === dateStr,
                  );
                });

                const currentStreak = last7Days.filter(Boolean).length;

                return (
                  <div
                    key={habit.id}
                    className="p-4 rounded-[var(--radius-lg)] surface-2"
                  >
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold mb-1">
                        {habit.name}
                      </h3>
                      <GlowBadge variant="neutral">
                        {habit.type.toLowerCase().replace("_", " ")}
                      </GlowBadge>
                    </div>
                    <StreakDots days={last7Days} className="mb-3" />
                    <div className="text-xs text-muted">
                      {currentStreak}/{habit.targetFrequency} this week
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
