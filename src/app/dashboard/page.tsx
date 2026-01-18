"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Failed to load dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Command Center</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || "Simba"}
            </p>
          </div>

          {data.alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 rounded-lg border border-orange-500/50 bg-orange-500/10 p-4"
                >
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-500">{alert.title}</p>
                    <p className="text-sm text-orange-500/80">
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  One Thing
                </CardTitle>
                <CardDescription>
                  Highest leverage action right now
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.oneThing ? (
                  <div>
                    <p className="font-medium mb-2">{data.oneThing.title}</p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>Impact: {data.oneThing.impact}/5</span>
                      {data.oneThing.estimatedMinutes && (
                        <span>• {data.oneThing.estimatedMinutes}m</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No high-impact tasks</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Momentum Score
                </CardTitle>
                <CardDescription>This week's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {data.momentumScore.score}/100
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deep Work</span>
                    <span>{data.momentumScore.metrics.deepWorkHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output</span>
                    <span>{data.momentumScore.metrics.outputCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Today
                </CardTitle>
                <CardDescription>
                  {data.todayTasks.length} tasks due
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.todayTasks.length > 0 ? (
                  <ul className="space-y-2">
                    {data.todayTasks.slice(0, 3).map((task) => (
                      <li key={task.id} className="text-sm">
                        {task.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No tasks due today</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Next Actions</CardTitle>
                <CardDescription>
                  Prioritized by impact and urgency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.nextActions.length > 0 ? (
                  <ul className="space-y-3">
                    {data.nextActions.slice(0, 8).map((task) => (
                      <li
                        key={task.id}
                        className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            <span>Priority: {task.priority}/5</span>
                            <span>Impact: {task.impact}/5</span>
                            {task.dueDate && (
                              <span>Due: {formatDate(task.dueDate)}</span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Start
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No pending tasks</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Goals</CardTitle>
                <CardDescription>This week's commitments</CardDescription>
              </CardHeader>
              <CardContent>
                {data.weeklyGoals.length > 0 ? (
                  <ul className="space-y-3">
                    {data.weeklyGoals.map((goal) => (
                      <li
                        key={goal.id}
                        className="pb-3 border-b border-border last:border-0"
                      >
                        <p className="font-medium mb-1">{goal.title}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {goal.progress}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>
                    <p className="text-muted-foreground mb-4">
                      No weekly goals set
                    </p>
                    <Button onClick={() => router.push("/goals")}>
                      Set Weekly Goals
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
