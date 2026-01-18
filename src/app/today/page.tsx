import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Panel } from "@/components/command/Panel";
import { GlowBadge } from "@/components/command/GlowBadge";

async function getTodayData(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { in: ["TODO", "IN_PROGRESS"] },
      OR: [
        { dueDate: { gte: today, lt: tomorrow } },
        { status: "IN_PROGRESS" },
      ],
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: {
      project: true,
    },
  });

  return { tasks };
}

export default async function TodayPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { tasks } = await getTodayData(session.user.id);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Today</h1>
          <p className="text-muted">Focus on what matters right now</p>
        </div>

        <Panel title={`Today's Tasks (${tasks.length})`}>
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p className="mb-4">No tasks for today</p>
              <Link
                href="/tasks"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-[hsl(var(--accent))] text-white hover:opacity-90 transition-opacity"
              >
                View all tasks
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks?selected=${task.id}`}
                  className="block p-4 rounded-[var(--radius-lg)] surface-2 hover:surface-3 lift-on-hover transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-sm font-medium">{task.title}</h3>
                    <div className="flex gap-2">
                      <GlowBadge
                        variant={task.priority >= 4 ? "danger" : "warning"}
                      >
                        P{task.priority}
                      </GlowBadge>
                      <GlowBadge variant="neutral">
                        {task.energyLevel.toLowerCase()}
                      </GlowBadge>
                    </div>
                  </div>
                  {task.notes && (
                    <p className="text-xs text-muted mb-2">
                      {task.notes.substring(0, 100)}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-subtle">
                    {task.project && <span>📁 {task.project.name}</span>}
                    {task.estimatedMinutes && (
                      <span>⏱️ {task.estimatedMinutes}m</span>
                    )}
                    {task.dueDate && (
                      <span>
                        📅{" "}
                        {new Date(task.dueDate).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
