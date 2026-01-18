import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Panel } from "@/components/command/Panel";
import { GlowBadge } from "@/components/command/GlowBadge";

async function getProjectsData(userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      userId,
      status: { not: "ARCHIVED" },
    },
    include: {
      tasks: {
        where: { status: { not: "DONE" } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { projects };
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { projects } = await getProjectsData(session.user.id);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted">
            Track your active projects and milestones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full">
              <Panel>
                <div className="text-center py-16 text-muted">
                  <p className="mb-4">No projects yet</p>
                  <p className="text-sm text-subtle">
                    Projects help you organize related tasks
                  </p>
                </div>
              </Panel>
            </div>
          ) : (
            projects.map((project) => {
              const totalTasks = project.tasks.length;
              const progress = totalTasks > 0 ? 0 : 0;

              return (
                <Panel key={project.id}>
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <GlowBadge
                        variant={
                          project.status === "ACTIVE" ? "success" : "neutral"
                        }
                      >
                        {project.status.toLowerCase()}
                      </GlowBadge>
                    </div>
                    {project.mission && (
                      <p className="text-sm text-muted mb-3">
                        {project.mission}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {project.nextAction && (
                      <div className="text-sm">
                        <span className="text-muted">Next: </span>
                        <span>{project.nextAction}</span>
                      </div>
                    )}
                    {project.weeklyGoal && (
                      <div className="text-sm">
                        <span className="text-muted">This week: </span>
                        <span>{project.weeklyGoal}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <GlowBadge variant="neutral">
                      {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
                    </GlowBadge>
                  </div>
                </Panel>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
