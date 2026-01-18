"use client";

import * as React from "react";
import { Panel } from "./Panel";
import { GlowBadge } from "./GlowBadge";
import {
  Plus,
  Check,
  X,
  Edit2,
  Calendar,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SortOption = "dueDate" | "urgency" | "priority";

interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: Date | string;
  priority: number;
  impact: number;
  status: string;
  energyLevel: string;
  estimatedMinutes?: number;
  project?: { name: string };
}

interface TaskManagementPanelProps {
  initialTasks: Task[];
}

export function TaskManagementPanel({
  initialTasks,
}: TaskManagementPanelProps) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [sortBy, setSortBy] = React.useState<SortOption>("urgency");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [showNewTaskForm, setShowNewTaskForm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newTask, setNewTask] = React.useState({
    title: "",
    dueDate: "",
    priority: 3,
    impact: 3,
  });

  // Calculate urgency score based on due date and priority
  const getUrgencyScore = (task: Task) => {
    if (!task.dueDate) return task.priority * 10;

    const now = new Date();
    const due = new Date(task.dueDate);
    const daysUntil = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let urgency = task.priority * 10;
    if (daysUntil < 0)
      urgency += 100; // Overdue
    else if (daysUntil === 0)
      urgency += 80; // Due today
    else if (daysUntil === 1)
      urgency += 60; // Due tomorrow
    else if (daysUntil <= 3)
      urgency += 40; // Due within 3 days
    else if (daysUntil <= 7) urgency += 20; // Due within a week

    return urgency;
  };

  // Sort tasks based on selected option
  const sortedTasks = React.useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status !== "DONE");

    return [...activeTasks].sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return b.priority - a.priority;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "urgency") {
        return getUrgencyScore(b) - getUrgencyScore(a);
      } else {
        return b.priority - a.priority;
      }
    });
  }, [tasks, sortBy]);

  const handleToggleComplete = async (
    taskId: string,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setError(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          dueDate: newTask.dueDate || null,
          priority: newTask.priority,
          impact: newTask.impact,
          status: "TODO",
          energyLevel: "MEDIUM",
        }),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
        setNewTask({ title: "", dueDate: "", priority: 3, impact: 3 });
        setShowNewTaskForm(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Network error - please try again");
    }
  };

  const getUrgencyBadge = (task: Task) => {
    if (!task.dueDate) return null;

    const now = new Date();
    const due = new Date(task.dueDate);
    const daysUntil = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil < 0) {
      return <GlowBadge variant="danger">Overdue</GlowBadge>;
    } else if (daysUntil === 0) {
      return <GlowBadge variant="danger">Due Today</GlowBadge>;
    } else if (daysUntil === 1) {
      return <GlowBadge variant="warning">Due Tomorrow</GlowBadge>;
    } else if (daysUntil <= 3) {
      return <GlowBadge variant="warning">{daysUntil}d left</GlowBadge>;
    } else if (daysUntil <= 7) {
      return <GlowBadge variant="neutral">{daysUntil}d left</GlowBadge>;
    }
    return <GlowBadge variant="neutral">{daysUntil}d</GlowBadge>;
  };

  return (
    <Panel
      title="📋 Tasks & Deadlines"
      subtitle={`${sortedTasks.length} active tasks`}
    >
      <div className="space-y-4">
        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("urgency")}
              className={`px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all ${
                sortBy === "urgency"
                  ? "bg-[hsl(var(--accent))] text-white"
                  : "surface-2 hover:surface-3"
              }`}
            >
              Urgency
            </button>
            <button
              onClick={() => setSortBy("dueDate")}
              className={`px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all ${
                sortBy === "dueDate"
                  ? "bg-[hsl(var(--accent))] text-white"
                  : "surface-2 hover:surface-3"
              }`}
            >
              Due Date
            </button>
            <button
              onClick={() => setSortBy("priority")}
              className={`px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all ${
                sortBy === "priority"
                  ? "bg-[hsl(var(--accent))] text-white"
                  : "surface-2 hover:surface-3"
              }`}
            >
              Priority
            </button>
          </div>

          <button
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] bg-[hsl(var(--accent))] text-white hover:opacity-90 transition-opacity text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger))] text-[hsl(var(--danger))] text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                {error.includes("sign") && (
                  <p className="text-xs mt-1">
                    Please sign out and sign back in to continue.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Task Form */}
        <AnimatePresence>
          {showNewTaskForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateTask}
              className="p-4 rounded-[var(--radius-lg)] surface-2 space-y-3"
            >
              <input
                type="text"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Task title..."
                className="w-full px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] outline-none text-sm"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted mb-1 block">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] outline-none text-sm"
                  >
                    <option value={5}>P5 - Critical</option>
                    <option value={4}>P4 - High</option>
                    <option value={3}>P3 - Medium</option>
                    <option value={2}>P2 - Low</option>
                    <option value={1}>P1 - Minimal</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--accent))] text-white hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTaskForm(false);
                    setNewTask({
                      title: "",
                      dueDate: "",
                      priority: 3,
                      impact: 3,
                    });
                  }}
                  className="px-3 py-2 rounded-[var(--radius)] surface-2 hover:surface-3 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No active tasks</p>
              <p className="text-xs">Click "New Task" to get started</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-[var(--radius-lg)] surface-2 hover:surface-3 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task.id, task.status)}
                    className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      task.status === "DONE"
                        ? "bg-[hsl(var(--success))] border-[hsl(var(--success))]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--accent))]"
                    }`}
                  >
                    {task.status === "DONE" && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(task.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="flex-1 px-2 py-1 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--accent))] outline-none text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          className="p-1 rounded-[var(--radius)] bg-[hsl(var(--success))] text-white hover:opacity-90"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded-[var(--radius)] surface-2 hover:surface-3"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-medium group-hover:text-[hsl(var(--accent))] transition-colors">
                          {task.title}
                        </h4>
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-[var(--radius)] hover:bg-[hsl(var(--border))] transition-all"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {getUrgencyBadge(task)}
                      <GlowBadge
                        variant={task.priority >= 4 ? "danger" : "neutral"}
                      >
                        P{task.priority}
                      </GlowBadge>
                      {task.dueDate && (
                        <span className="text-muted flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.project && (
                        <span className="text-muted">
                          📁 {task.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}
