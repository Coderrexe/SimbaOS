import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Panel } from "@/components/command/Panel";
import { GlowBadge } from "@/components/command/GlowBadge";

async function getTasksData(userId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { not: "DONE" },
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: {
      project: true,
    },
  });

  return { tasks };
}

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { tasks } = await getTasksData(session.user.id);

  const groupedTasks = {
    inbox: tasks.filter((t) => t.status === "INBOX"),
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS"),
    todo: tasks.filter((t) => t.status === "TODO"),
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted">Manage all your tasks and actions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel title={`In Progress (${groupedTasks.inProgress.length})`}>
            {groupedTasks.inProgress.length === 0 ? (
              <p className="text-center py-8 text-muted">
                No tasks in progress
              </p>
            ) : (
              <div className="space-y-2">
                {groupedTasks.inProgress.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title={`To Do (${groupedTasks.todo.length})`}>
            {groupedTasks.todo.length === 0 ? (
              <p className="text-center py-8 text-muted">No pending tasks</p>
            ) : (
              <div className="space-y-2">
                {groupedTasks.todo.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title={`Inbox (${groupedTasks.inbox.length})`}>
            {groupedTasks.inbox.length === 0 ? (
              <p className="text-center py-8 text-muted">Inbox is empty</p>
            ) : (
              <div className="space-y-2">
                {groupedTasks.inbox.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: any }) {
  return (
    <div className="p-3 rounded-[var(--radius)] surface-2 hover:surface-3 transition-all">
      <h3 className="text-sm font-medium mb-2">{task.title}</h3>
      <div className="flex flex-wrap gap-2">
        <GlowBadge variant={task.priority >= 4 ? "danger" : "warning"}>
          P{task.priority}
        </GlowBadge>
        <GlowBadge variant="neutral">
          {task.energyLevel.toLowerCase()}
        </GlowBadge>
        {task.project && (
          <GlowBadge variant="neutral">{task.project.name}</GlowBadge>
        )}
      </div>
    </div>
  );
}
