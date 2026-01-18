"use client";

import * as React from "react";
import { useCommand } from "@/lib/command-context";
import { Panel } from "@/components/command/Panel";
import { GlowBadge } from "@/components/command/GlowBadge";
import {
  MicroSparkline,
  ProgressRing,
  StreakDots,
} from "@/components/command/MicroChart";
import {
  Target,
  Zap,
  Clock,
  Flame,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface CommandData {
  topTasks: any[];
  metrics: any[];
  todayTasks: any[];
  nextActions: any[];
  projects: any[];
  inboxItems: any[];
  staleProjects: any[];
  overdueTasks: any[];
  habits: any[];
}

export function CommandPageClient({ data }: { data: CommandData }) {
  const { setSelection } = useCommand();

  // Process metrics for trajectory
  const weekMetrics = React.useMemo(() => {
    const deepWorkData: number[] = [];
    const sleepData: number[] = [];
    const workoutDays: boolean[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayDeepWork = data.metrics.find(
        (m) =>
          m.type === "DEEP_WORK_HOURS" &&
          m.date.toISOString().split("T")[0] === dateStr,
      );
      deepWorkData.push(dayDeepWork?.value || 0);

      const daySleep = data.metrics.find(
        (m) =>
          m.type === "SLEEP_AVERAGE" &&
          m.date.toISOString().split("T")[0] === dateStr,
      );
      sleepData.push(daySleep?.value || 0);

      const dayFitness = data.metrics.find(
        (m) =>
          m.type === "FITNESS_SESSIONS" &&
          m.date.toISOString().split("T")[0] === dateStr,
      );
      workoutDays.push((dayFitness?.value || 0) > 0);
    }

    return { deepWorkData, sleepData, workoutDays };
  }, [data.metrics]);

  const totalDeepWork = weekMetrics.deepWorkData.reduce((a, b) => a + b, 0);
  const avgSleep =
    weekMetrics.sleepData.filter((v) => v > 0).reduce((a, b) => a + b, 0) /
    (weekMetrics.sleepData.filter((v) => v > 0).length || 1);
  const workoutCount = weekMetrics.workoutDays.filter(Boolean).length;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Top Row: Outcomes + Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopOutcomesPanel tasks={data.topTasks} onSelect={setSelection} />
          <TrajectoryPanel
            deepWork={weekMetrics.deepWorkData}
            sleep={weekMetrics.sleepData}
            workouts={weekMetrics.workoutDays}
            totalDeepWork={totalDeepWork}
            avgSleep={avgSleep}
            workoutCount={workoutCount}
          />
        </div>

        {/* Middle Row: Timeline + Next Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimelinePanel tasks={data.todayTasks} />
          </div>
          <NextActionsPanel
            actions={data.nextActions}
            onSelect={setSelection}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ProjectLanesPanel projects={data.projects} onSelect={setSelection} />
        </div>

        {/* Bottom Row: Inbox + Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InboxPanel items={data.inboxItems} onSelect={setSelection} />
          <SignalsPanel
            staleProjects={data.staleProjects}
            overdueTasks={data.overdueTasks}
          />
        </div>
      </div>
    </div>
  );
}

function TopOutcomesPanel({
  tasks,
  onSelect,
}: {
  tasks: any[];
  onSelect: any;
}) {
  if (tasks.length === 0) {
    return (
      <Panel
        title="Top Outcomes"
        subtitle="Your 1-3 most important goals this week"
      >
        <div className="text-center py-8 text-muted">
          <p className="mb-4">No high-priority tasks yet</p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-[hsl(var(--accent))] text-white hover:opacity-90 transition-opacity"
          >
            Create your first task
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Top Outcomes"
      subtitle="Your 1-3 most important goals this week"
    >
      <div className="space-y-3">
        {tasks.slice(0, 3).map((task) => {
          const daysUntilDue = task.dueDate
            ? Math.ceil(
                (new Date(task.dueDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              )
            : null;
          const dueText =
            daysUntilDue === null
              ? "No due date"
              : daysUntilDue < 0
                ? `${Math.abs(daysUntilDue)}d overdue`
                : daysUntilDue === 0
                  ? "Due today"
                  : daysUntilDue === 1
                    ? "Due tomorrow"
                    : `${daysUntilDue}d left`;

          return (
            <Link
              key={task.id}
              href={`/tasks?selected=${task.id}`}
              onClick={() => onSelect({ type: "task", id: task.id })}
              className="block w-full text-left p-4 rounded-[var(--radius-lg)] surface-2 hover:surface-3 lift-on-hover transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <ProgressRing
                    value={
                      task.status === "DONE"
                        ? 100
                        : task.status === "IN_PROGRESS"
                          ? 50
                          : 0
                    }
                    size={40}
                    strokeWidth={3}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium group-hover:text-[hsl(var(--accent))] transition-colors">
                      {task.title}
                    </h4>
                    <GlowBadge
                      variant={task.priority >= 4 ? "danger" : "warning"}
                    >
                      {dueText}
                    </GlowBadge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Target className="h-3 w-3" />
                    <span>
                      Priority {task.priority}/5 • Impact {task.impact}/5
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}

function TrajectoryPanel({
  deepWork,
  sleep,
  workouts,
  totalDeepWork,
  avgSleep,
  workoutCount,
}: any) {
  return (
    <Panel title="Trajectory" subtitle="Week progress & health signals">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-[var(--radius)] surface-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Deep Work</span>
            <Zap className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
          </div>
          <div className="text-2xl font-semibold mb-1">
            {totalDeepWork.toFixed(1)}h
          </div>
          <MicroSparkline data={deepWork} color="accent" />
          <div className="text-xs text-muted mt-1">Target: 35h/week</div>
        </div>

        <div className="p-3 rounded-[var(--radius)] surface-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Sleep Avg</span>
            <Clock className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
          </div>
          <div className="text-2xl font-semibold mb-1">
            {avgSleep.toFixed(1)}h
          </div>
          <MicroSparkline data={sleep} color="success" />
          <div className="text-xs text-muted mt-1">
            {avgSleep >= 7 ? "Optimal range" : "Below target"}
          </div>
        </div>

        <div className="p-3 rounded-[var(--radius)] surface-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Workouts</span>
            <Flame className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
          </div>
          <div className="text-2xl font-semibold mb-1">{workoutCount}/7</div>
          <StreakDots days={workouts} className="mt-2" />
          <div className="text-xs text-muted mt-1">
            {workoutCount >= 5 ? "Strong week" : "Keep going"}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TimelinePanel({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) {
    return (
      <Panel title="Today Timeline" subtitle="Schedule + focus blocks">
        <div className="text-center py-8 text-muted">
          <p>No tasks scheduled for today</p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Today Timeline" subtitle="Schedule + focus blocks">
      <div className="space-y-2">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/tasks?selected=${task.id}`}
            className="flex items-center gap-3 p-3 rounded-[var(--radius)] surface-2 hover:surface-3 transition-all"
          >
            <div className="text-xs font-medium text-muted w-16">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Anytime"}
            </div>
            <div
              className={`w-1 h-8 rounded-full ${
                task.status === "IN_PROGRESS"
                  ? "bg-[hsl(var(--accent))]"
                  : task.priority >= 4
                    ? "bg-[hsl(var(--warning))]"
                    : "bg-[hsl(var(--border))]"
              }`}
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{task.title}</div>
              <div className="text-xs text-muted">
                {task.estimatedMinutes
                  ? `${task.estimatedMinutes}m`
                  : "No estimate"}{" "}
                • {task.energyLevel}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function NextActionsPanel({
  actions,
  onSelect,
}: {
  actions: any[];
  onSelect: any;
}) {
  if (actions.length === 0) {
    return (
      <Panel title="Next Actions" subtitle="Filtered by energy + priority">
        <div className="text-center py-8 text-muted">
          <p>All caught up!</p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Next Actions" subtitle="Filtered by energy + priority">
      <div className="space-y-2">
        {actions.slice(0, 5).map((action) => (
          <Link
            key={action.id}
            href={`/tasks?selected=${action.id}`}
            onClick={() => onSelect({ type: "task", id: action.id })}
            className="block w-full text-left p-3 rounded-[var(--radius)] surface-2 hover:surface-3 lift-on-hover transition-all"
          >
            <div className="text-sm font-medium mb-1">{action.title}</div>
            <div className="flex gap-2">
              <GlowBadge variant="neutral" className="text-xs">
                {action.energyLevel.toLowerCase()} energy
              </GlowBadge>
              <GlowBadge variant={action.priority >= 4 ? "danger" : "warning"}>
                P{action.priority}
              </GlowBadge>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function ProjectLanesPanel({
  projects,
  onSelect,
}: {
  projects: any[];
  onSelect: any;
}) {
  if (projects.length === 0) {
    return (
      <Panel
        title="Project Lanes"
        subtitle="Active projects with next milestone"
      >
        <div className="text-center py-8 text-muted">
          <p className="mb-4">No active projects</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-[hsl(var(--accent))] text-white hover:opacity-90 transition-opacity"
          >
            Create a project
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Project Lanes" subtitle="Active projects with next milestone">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.slice(0, 5).map((project) => {
          const totalTasks = project.tasks.length;
          const completedTasks = project.tasks.filter(
            (t: any) => t.status === "DONE",
          ).length;
          const progress =
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0;

          return (
            <Link
              key={project.id}
              href={`/projects?selected=${project.id}`}
              onClick={() => onSelect({ type: "project", id: project.id })}
              className="block text-left p-4 rounded-[var(--radius-lg)] surface-2 hover:surface-3 lift-on-hover transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-semibold">{project.name}</h4>
                <GlowBadge variant="neutral">{totalTasks}</GlowBadge>
              </div>
              <div className="text-xs text-muted mb-3">
                Next: {project.nextAction || "No next action set"}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--border))]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--accent))]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted">{progress}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}

function InboxPanel({ items, onSelect }: { items: any[]; onSelect: any }) {
  if (items.length === 0) {
    return (
      <Panel title="Inbox" subtitle="Uncategorized captures">
        <div className="text-center py-8 text-muted">
          <p>Inbox is empty</p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Inbox" subtitle="Uncategorized captures">
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/tasks?selected=${item.id}`}
            onClick={() => onSelect({ type: "task", id: item.id })}
            className="block w-full text-left p-3 rounded-[var(--radius)] surface-2 hover:surface-3 transition-all text-sm"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function SignalsPanel({
  staleProjects,
  overdueTasks,
}: {
  staleProjects: any[];
  overdueTasks: any[];
}) {
  const signals = [
    ...staleProjects.map((p) => ({
      type: "warning" as const,
      message: `Project "${p.name}" hasn't been updated in ${Math.ceil((Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days`,
      icon: AlertCircle,
    })),
    ...overdueTasks.map((t) => ({
      type: "warning" as const,
      message: `"${t.title}" is overdue`,
      icon: AlertCircle,
    })),
  ];

  if (signals.length === 0) {
    return (
      <Panel title="Signals" subtitle="Quiet attention pings">
        <div className="text-center py-8">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--success))]" />
          <p className="text-sm text-[hsl(var(--success))]">
            All systems green!
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Signals" subtitle="Quiet attention pings">
      <div className="space-y-2">
        {signals.slice(0, 5).map((signal, idx) => {
          const Icon = signal.icon;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-[var(--radius)] ${
                signal.type === "warning"
                  ? "bg-[hsl(var(--warning)/0.1)]"
                  : "bg-[hsl(var(--success)/0.1)]"
              }`}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                  signal.type === "warning"
                    ? "text-[hsl(var(--warning))]"
                    : "text-[hsl(var(--success))]"
                }`}
              />
              <span className="text-sm">{signal.message}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
