import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Panel } from "@/components/command/Panel";
import { GlowBadge } from "@/components/command/GlowBadge";
import { ProgressRing } from "@/components/command/MicroChart";

async function getGoalsData(userId: string) {
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
  });

  return { goals };
}

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { goals } = await getGoalsData(session.user.id);

  const groupedGoals = {
    northStar: goals.filter((g) => g.type === "NORTH_STAR"),
    quarterly: goals.filter((g) => g.type === "QUARTERLY"),
    weekly: goals.filter((g) => g.type === "WEEKLY"),
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Goals</h1>
          <p className="text-muted">
            Track your long-term vision and objectives
          </p>
        </div>

        <div className="space-y-6">
          <Panel title="North Star Goals" subtitle="Your long-term vision">
            {groupedGoals.northStar.length === 0 ? (
              <p className="text-center py-8 text-muted">
                No north star goals set
              </p>
            ) : (
              <div className="space-y-3">
                {groupedGoals.northStar.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Quarterly OKRs" subtitle="This quarter's objectives">
            {groupedGoals.quarterly.length === 0 ? (
              <p className="text-center py-8 text-muted">
                No quarterly goals set
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedGoals.quarterly.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Weekly Commitments" subtitle="This week's focus">
            {groupedGoals.weekly.length === 0 ? (
              <p className="text-center py-8 text-muted">No weekly goals set</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groupedGoals.weekly.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: any }) {
  return (
    <div className="p-4 rounded-[var(--radius-lg)] surface-2">
      <div className="flex items-start gap-3 mb-3">
        <ProgressRing value={goal.progress} size={40} strokeWidth={3} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1">{goal.title}</h3>
          {goal.description && (
            <p className="text-xs text-muted">{goal.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <GlowBadge variant="accent">{goal.progress}%</GlowBadge>
        {goal.targetDate && (
          <span className="text-xs text-muted">
            Due {new Date(goal.targetDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
