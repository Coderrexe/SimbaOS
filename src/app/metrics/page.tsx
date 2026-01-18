import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Panel } from "@/components/command/Panel";
import { MicroSparkline } from "@/components/command/MicroChart";

async function getMetricsData(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const metrics = await prisma.metric.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: "asc" },
  });

  return { metrics };
}

export default async function MetricsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { metrics } = await getMetricsData(session.user.id);

  const metricsByType = {
    deepWork: metrics
      .filter((m) => m.type === "DEEP_WORK_HOURS")
      .map((m) => m.value),
    output: metrics
      .filter((m) => m.type === "OUTPUT_SHIPPED")
      .map((m) => m.value),
    fitness: metrics
      .filter((m) => m.type === "FITNESS_SESSIONS")
      .map((m) => m.value),
    sleep: metrics
      .filter((m) => m.type === "SLEEP_AVERAGE")
      .map((m) => m.value),
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Metrics</h1>
          <p className="text-muted">Track your performance and progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Panel title="Deep Work Hours" subtitle="Last 30 days">
            {metricsByType.deepWork.length === 0 ? (
              <p className="text-center py-8 text-muted">No data yet</p>
            ) : (
              <div>
                <div className="text-3xl font-bold mb-4">
                  {metricsByType.deepWork.reduce((a, b) => a + b, 0).toFixed(1)}
                  h total
                </div>
                <MicroSparkline
                  data={metricsByType.deepWork}
                  color="accent"
                  className="h-16 w-full"
                />
              </div>
            )}
          </Panel>

          <Panel title="Output Shipped" subtitle="Last 30 days">
            {metricsByType.output.length === 0 ? (
              <p className="text-center py-8 text-muted">No data yet</p>
            ) : (
              <div>
                <div className="text-3xl font-bold mb-4">
                  {metricsByType.output.reduce((a, b) => a + b, 0)} items
                </div>
                <MicroSparkline
                  data={metricsByType.output}
                  color="success"
                  className="h-16 w-full"
                />
              </div>
            )}
          </Panel>

          <Panel title="Fitness Sessions" subtitle="Last 30 days">
            {metricsByType.fitness.length === 0 ? (
              <p className="text-center py-8 text-muted">No data yet</p>
            ) : (
              <div>
                <div className="text-3xl font-bold mb-4">
                  {metricsByType.fitness.reduce((a, b) => a + b, 0)} sessions
                </div>
                <MicroSparkline
                  data={metricsByType.fitness}
                  color="warning"
                  className="h-16 w-full"
                />
              </div>
            )}
          </Panel>

          <Panel title="Sleep Average" subtitle="Last 30 days">
            {metricsByType.sleep.length === 0 ? (
              <p className="text-center py-8 text-muted">No data yet</p>
            ) : (
              <div>
                <div className="text-3xl font-bold mb-4">
                  {(
                    metricsByType.sleep.reduce((a, b) => a + b, 0) /
                    metricsByType.sleep.length
                  ).toFixed(1)}
                  h avg
                </div>
                <MicroSparkline
                  data={metricsByType.sleep}
                  color="success"
                  className="h-16 w-full"
                />
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
