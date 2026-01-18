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

export default function CommandPage() {
  const { mode, setSelection } = useCommand();

  return (
    <div className="min-h-screen pb-20">
      {/* Center Stage - Grid-based Cockpit Surface */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Top Row: Outcomes + Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopOutcomesPanel onSelect={setSelection} />
          <TrajectoryPanel />
        </div>

        {/* Middle Row: Timeline + Next Actions + Project Lanes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimelinePanel mode={mode} />
          </div>
          <NextActionsPanel onSelect={setSelection} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ProjectLanesPanel onSelect={setSelection} />
        </div>

        {/* Bottom Row: Inbox + Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InboxPanel onSelect={setSelection} />
          <SignalsPanel />
        </div>
      </div>
    </div>
  );
}

function TopOutcomesPanel({ onSelect }: { onSelect: any }) {
  const outcomes = [
    {
      id: "1",
      title: "Ship MVP authentication flow",
      progress: 75,
      priority: "high",
      dueIn: "2 days",
    },
    {
      id: "2",
      title: "Complete investor deck",
      progress: 40,
      priority: "high",
      dueIn: "5 days",
    },
    {
      id: "3",
      title: "Hire senior engineer",
      progress: 20,
      priority: "medium",
      dueIn: "2 weeks",
    },
  ];

  return (
    <Panel
      title="Top Outcomes"
      subtitle="Your 1-3 most important goals this week"
    >
      <div className="space-y-3">
        {outcomes.map((outcome, idx) => (
          <button
            key={outcome.id}
            onClick={() => onSelect({ type: "task", id: outcome.id })}
            className="w-full text-left p-4 rounded-[var(--radius-lg)] surface-2 hover:surface-3 lift-on-hover transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <ProgressRing
                  value={outcome.progress}
                  size={40}
                  strokeWidth={3}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium group-hover:text-[hsl(var(--accent))] transition-colors">
                    {outcome.title}
                  </h4>
                  <GlowBadge
                    variant={outcome.priority === "high" ? "danger" : "warning"}
                  >
                    {outcome.dueIn}
                  </GlowBadge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Target className="h-3 w-3" />
                  <span>{outcome.progress}% complete</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function TrajectoryPanel() {
  const weekData = {
    deepWork: [4, 6, 5, 7, 8, 6, 5],
    sleep: [7, 6.5, 7.5, 6, 7, 8, 7],
    workouts: [true, true, false, true, true, false, true],
  };

  return (
    <Panel title="Trajectory" subtitle="Week progress & health signals">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-[var(--radius)] surface-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Deep Work</span>
            <Zap className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
          </div>
          <div className="text-2xl font-semibold mb-1">32h</div>
          <MicroSparkline data={weekData.deepWork} color="accent" />
          <div className="text-xs text-muted mt-1">Target: 35h/week</div>
        </div>

        <div className="p-3 rounded-[var(--radius)] surface-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Sleep Avg</span>
            <Clock className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
          </div>
          <div className="text-2xl font-semibold mb-1">7.1h</div>
          <MicroSparkline data={weekData.sleep} color="success" />
          <div className="text-xs text-muted mt-1">Optimal range</div>
        </div>

        <div className="p-3 rounded-[var(--radius)] surface-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Workouts</span>
            <Flame className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
          </div>
          <div className="text-2xl font-semibold mb-1">5/7</div>
          <StreakDots days={weekData.workouts} className="mt-2" />
          <div className="text-xs text-muted mt-1">Strong week</div>
        </div>
      </div>
    </Panel>
  );
}

function TimelinePanel({ mode }: { mode: string }) {
  const blocks = [
    {
      time: "9:00",
      title: "Deep work: Auth flow",
      type: "focus",
      duration: "2h",
    },
    { time: "11:00", title: "Team standup", type: "meeting", duration: "30m" },
    {
      time: "14:00",
      title: "Deep work: Investor deck",
      type: "focus",
      duration: "3h",
    },
    { time: "17:00", title: "Review PRs", type: "task", duration: "1h" },
  ];

  return (
    <Panel title="Today Timeline" subtitle="Schedule + focus blocks">
      <div className="space-y-2">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-[var(--radius)] surface-2 hover:surface-3 transition-all"
          >
            <div className="text-xs font-medium text-muted w-12">
              {block.time}
            </div>
            <div
              className={`w-1 h-8 rounded-full ${
                block.type === "focus"
                  ? "bg-[hsl(var(--accent))]"
                  : block.type === "meeting"
                    ? "bg-[hsl(var(--warning))]"
                    : "bg-[hsl(var(--border))]"
              }`}
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{block.title}</div>
              <div className="text-xs text-muted">{block.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NextActionsPanel({ onSelect }: { onSelect: any }) {
  const actions = [
    { id: "1", title: "Review Sarah's PR", energy: "low", priority: "high" },
    { id: "2", title: "Draft Q1 roadmap", energy: "high", priority: "high" },
    {
      id: "3",
      title: "Update dependencies",
      energy: "low",
      priority: "medium",
    },
  ];

  return (
    <Panel title="Next Actions" subtitle="Filtered by energy + priority">
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelect({ type: "task", id: action.id })}
            className="w-full text-left p-3 rounded-[var(--radius)] surface-2 hover:surface-3 lift-on-hover transition-all"
          >
            <div className="text-sm font-medium mb-1">{action.title}</div>
            <div className="flex gap-2">
              <GlowBadge variant="neutral" className="text-xs">
                {action.energy} energy
              </GlowBadge>
              <GlowBadge
                variant={action.priority === "high" ? "danger" : "warning"}
              >
                {action.priority}
              </GlowBadge>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function ProjectLanesPanel({ onSelect }: { onSelect: any }) {
  const projects = [
    {
      id: "1",
      name: "SimbaOS MVP",
      tasks: 8,
      next: "Complete auth",
      progress: 65,
    },
    {
      id: "2",
      name: "Fundraising",
      tasks: 5,
      next: "Finalize deck",
      progress: 40,
    },
    {
      id: "3",
      name: "Hiring",
      tasks: 3,
      next: "Schedule interviews",
      progress: 20,
    },
  ];

  return (
    <Panel title="Project Lanes" subtitle="Active projects with next milestone">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelect({ type: "project", id: project.id })}
            className="text-left p-4 rounded-[var(--radius-lg)] surface-2 hover:surface-3 lift-on-hover transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-semibold">{project.name}</h4>
              <GlowBadge variant="neutral">{project.tasks}</GlowBadge>
            </div>
            <div className="text-xs text-muted mb-3">Next: {project.next}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--border))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--accent))]"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted">{project.progress}%</span>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function InboxPanel({ onSelect }: { onSelect: any }) {
  const items = [
    { id: "1", text: "Research competitor pricing models", type: "idea" },
    { id: "2", text: "Follow up with Alex about partnership", type: "task" },
    { id: "3", text: "Read article on product-market fit", type: "note" },
  ];

  return (
    <Panel title="Inbox" subtitle="Uncategorized captures">
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect({ type: "task", id: item.id })}
            className="w-full text-left p-3 rounded-[var(--radius)] surface-2 hover:surface-3 transition-all text-sm"
          >
            {item.text}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function SignalsPanel() {
  const signals = [
    {
      type: "warning",
      message: 'Project "Mobile App" hasn\'t been touched in 12 days',
      icon: AlertCircle,
    },
    {
      type: "success",
      message: "Meditation streak: 7 days 🔥",
      icon: TrendingUp,
    },
    {
      type: "warning",
      message: "Haven't contacted Mom in 8 days",
      icon: AlertCircle,
    },
  ];

  return (
    <Panel title="Signals" subtitle="Quiet attention pings">
      <div className="space-y-2">
        {signals.map((signal, idx) => {
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
