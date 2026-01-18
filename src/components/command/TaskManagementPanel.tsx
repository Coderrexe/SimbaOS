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
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SortOption = "dueDate" | "urgency" | "priority";

interface Task {
  id: string;
  title: string;
  notes?: string;
  description?: string;
  dueDate?: Date | string;
  priority: number;
  impact: number;
  status: string;
  energyLevel: string;
  estimatedMinutes?: number;
  project?: { name: string };
  completedAt?: Date | string;
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
  const [editData, setEditData] = React.useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [showNewTaskForm, setShowNewTaskForm] = React.useState(false);
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completingId, setCompletingId] = React.useState<string | null>(null);
  const [celebratingId, setCelebratingId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [newTask, setNewTask] = React.useState({
    title: "",
    description: "",
    dueDate: "",
    priority: 3,
    impact: 3,
  });

  const getUrgencyScore = (task: Task) => {
    if (!task.dueDate) return task.priority * 10;

    const now = new Date();
    const due = new Date(task.dueDate);
    const daysUntil = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let urgency = task.priority * 10;
    if (daysUntil < 0) urgency += 100;
    else if (daysUntil === 0) urgency += 80;
    else if (daysUntil === 1) urgency += 60;
    else if (daysUntil <= 3) urgency += 40;
    else if (daysUntil <= 7) urgency += 20;

    return urgency;
  };

  const sortedTasks = React.useMemo(() => {
    const filteredTasks = showCompleted
      ? tasks.filter((t) => t.status === "DONE")
      : tasks.filter((t) => t.status !== "DONE");

    return [...filteredTasks].sort((a, b) => {
      if (showCompleted) {
        return (
          new Date(b.completedAt || 0).getTime() -
          new Date(a.completedAt || 0).getTime()
        );
      }

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
  }, [tasks, sortBy, showCompleted]);

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

        if (newStatus === "DONE") {
          // Show celebration animation
          setCelebratingId(taskId);

          // After 1 second, start the slide out
          setTimeout(() => {
            setCelebratingId(null);
            setCompletingId(taskId);

            // After slide completes, update state
            setTimeout(() => {
              setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
              setCompletingId(null);
            }, 500);
          }, 1000);
        } else {
          // For uncompleting, just update immediately
          setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setCompletingId(null);
      setCelebratingId(null);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editData.title.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description || null,
          dueDate: editData.dueDate || null,
        }),
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
    setEditData({ title: "", description: "", dueDate: "" });
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
          description: newTask.description || null,
          dueDate: newTask.dueDate || null,
          priority: newTask.priority,
          impact: newTask.impact,
          status: "TODO",
          energyLevel: "MEDIUM",
        }),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([createdTask, ...tasks]);
        setNewTask({
          title: "",
          description: "",
          dueDate: "",
          priority: 3,
          impact: 3,
        });
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

  const completedCount = tasks.filter((t) => t.status === "DONE").length;

  return (
    <Panel
      title="📋 Tasks & Deadlines"
      subtitle={
        showCompleted
          ? `${completedCount} completed tasks`
          : `${sortedTasks.length} active tasks`
      }
    >
      <div className="space-y-4">
        {/* Sort Options & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex gap-2 overflow-x-auto">
            {!showCompleted &&
              (["urgency", "dueDate", "priority"] as SortOption[]).map(
                (option) => (
                  <motion.button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all whitespace-nowrap ${
                      sortBy === option
                        ? "bg-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--accent)/0.3)]"
                        : "surface-2 hover:surface-3"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option === "urgency"
                      ? "Urgency"
                      : option === "dueDate"
                        ? "Due Date"
                        : "Priority"}
                  </motion.button>
                ),
              )}
          </div>

          <div className="flex gap-2">
            <motion.button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all whitespace-nowrap ${
                showCompleted
                  ? "bg-[hsl(var(--success))] text-white shadow-lg shadow-[hsl(var(--success)/0.3)]"
                  : "surface-2 hover:surface-3"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showCompleted ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {showCompleted ? "Hide" : `Completed (${completedCount})`}
              </span>
              <span className="sm:hidden">{completedCount}</span>
            </motion.button>

            {!showCompleted && (
              <motion.button
                onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] text-white hover:opacity-90 transition-opacity text-xs font-medium shadow-lg shadow-[hsl(var(--accent)/0.3)]"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-3.5 w-3.5" />
                New Task
              </motion.button>
            )}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger))] text-[hsl(var(--danger))] text-sm overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Task Form */}
        <AnimatePresence>
          {showNewTaskForm && !showCompleted && (
            <motion.form
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onSubmit={handleCreateTask}
              className="p-4 rounded-[var(--radius-lg)] surface-2 space-y-3 border border-[hsl(var(--accent)/0.2)] shadow-xl overflow-hidden"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm transition-all"
                  autoFocus
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
              >
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Add a description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm transition-all resize-none"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <label className="text-xs text-muted mb-1 block font-medium">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted mb-1 block font-medium">
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
                    className="w-full px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm transition-all"
                  >
                    <option value={5}>P5 - Critical</option>
                    <option value={4}>P4 - High</option>
                    <option value={3}>P3 - Medium</option>
                    <option value={2}>P2 - Low</option>
                    <option value={1}>P1 - Minimal</option>
                  </select>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
              >
                <motion.button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-[var(--radius)] bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] text-white hover:opacity-90 transition-opacity text-sm font-medium shadow-lg shadow-[hsl(var(--accent)/0.3)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  Create Task
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowNewTaskForm(false);
                    setNewTask({
                      title: "",
                      description: "",
                      dueDate: "",
                      priority: 3,
                      impact: 3,
                    });
                  }}
                  className="px-3 py-2 rounded-[var(--radius)] surface-2 hover:surface-3 transition-all text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 text-muted"
            >
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">
                {showCompleted ? "No completed tasks yet" : "No active tasks"}
              </p>
              <p className="text-xs">
                {showCompleted
                  ? "Complete some tasks to see them here"
                  : 'Click "New Task" to get started'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{
                    opacity: completingId === task.id ? 0 : 1,
                    x: completingId === task.id ? 100 : 0,
                    scale: completingId === task.id ? 0.8 : 1,
                    transition: {
                      delay: index * 0.03,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    x: 100,
                    scale: 0.8,
                    transition: { duration: 0.4 },
                  }}
                  whileHover={{
                    scale: showCompleted ? 1 : 1.02,
                    y: showCompleted ? 0 : -2,
                  }}
                  className="relative p-3 rounded-[var(--radius-lg)] surface-2 hover:surface-3 transition-all group shadow-sm hover:shadow-lg border border-transparent hover:border-[hsl(var(--accent)/0.2)]"
                >
                  {/* Celebration Animation */}
                  <AnimatePresence>
                    {celebratingId === task.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ duration: 0.6 }}
                          className="bg-[hsl(var(--success))] rounded-full p-4 shadow-2xl"
                        >
                          <CheckCircle2 className="h-12 w-12 text-white" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <motion.button
                      onClick={() => handleToggleComplete(task.id, task.status)}
                      className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        task.status === "DONE"
                          ? "bg-[hsl(var(--success))] border-[hsl(var(--success))] shadow-lg shadow-[hsl(var(--success)/0.3)]"
                          : "border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] hover:shadow-md"
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence>
                        {task.status === "DONE" && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                            }}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          <input
                            type="text"
                            value={editData.title}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                title: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(task.id);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="w-full px-2 py-1 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm"
                            autoFocus
                          />
                          <textarea
                            value={editData.description}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full px-2 py-1 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm resize-none"
                          />
                          <input
                            type="date"
                            value={editData.dueDate}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                dueDate: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm"
                          />
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleSaveEdit(task.id)}
                              className="p-1 rounded-[var(--radius)] bg-[hsl(var(--success))] text-white hover:opacity-90 shadow-md"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Check className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              onClick={handleCancelEdit}
                              className="p-1 rounded-[var(--radius)] surface-2 hover:surface-3"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          <div
                            className="cursor-pointer"
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4
                                className={`text-sm font-medium group-hover:text-[hsl(var(--accent))] transition-colors ${showCompleted ? "line-through opacity-60" : ""}`}
                              >
                                {task.title}
                              </h4>
                              {!showCompleted && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(task);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-[var(--radius)] hover:bg-[hsl(var(--border))] transition-all"
                                  whileHover={{ scale: 1.2, rotate: 15 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </motion.button>
                              )}
                            </div>

                            {task.description && (
                              <p className="text-xs text-muted mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {!showCompleted && getUrgencyBadge(task)}
                              <GlowBadge
                                variant={
                                  task.priority >= 4 ? "danger" : "neutral"
                                }
                              >
                                P{task.priority}
                              </GlowBadge>
                              {task.dueDate && (
                                <span className="text-muted flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString(
                                    "en-US",
                                  )}
                                </span>
                              )}
                              {showCompleted && task.completedAt && (
                                <span className="text-muted flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Completed{" "}
                                  {new Date(
                                    task.completedAt,
                                  ).toLocaleDateString("en-US")}
                                </span>
                              )}
                              {task.project && (
                                <span className="text-muted">
                                  📁 {task.project.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative overflow-hidden rounded-[var(--radius-lg)] p-6 w-full max-h-[500px] overflow-y-auto"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--surface1)) 0%, hsl(var(--surface2)) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 20px 60px hsl(var(--shadow) / 0.3)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-4 right-4 p-2 rounded-[var(--radius)] hover:bg-[hsl(var(--surface2))] transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Task Content */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedTask.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {getUrgencyBadge(selectedTask)}
                    <GlowBadge
                      variant={
                        selectedTask.priority >= 4 ? "danger" : "neutral"
                      }
                    >
                      P{selectedTask.priority}
                    </GlowBadge>
                    {selectedTask.status === "DONE" && (
                      <GlowBadge variant="success">Completed</GlowBadge>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedTask.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted mb-2">
                      Description
                    </h3>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-[var(--radius)] surface-2">
                  {selectedTask.dueDate && (
                    <div>
                      <p className="text-xs text-muted mb-1">Due Date</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedTask.dueDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  )}
                  {selectedTask.completedAt && (
                    <div>
                      <p className="text-xs text-muted mb-1">Completed</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {new Date(selectedTask.completedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  )}
                  {selectedTask.project && (
                    <div>
                      <p className="text-xs text-muted mb-1">Project</p>
                      <p className="text-sm font-medium">
                        📁 {selectedTask.project.name}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted mb-1">Priority</p>
                    <p className="text-sm font-medium">
                      P{selectedTask.priority}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]">
                  {selectedTask.status !== "DONE" ? (
                    <motion.button
                      onClick={() => {
                        handleToggleComplete(
                          selectedTask.id,
                          selectedTask.status,
                        );
                        setSelectedTask(null);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-[var(--radius)] bg-[hsl(var(--success))] text-white font-medium shadow-lg shadow-[hsl(var(--success)/0.3)] hover:opacity-90 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Check className="inline h-4 w-4 mr-2" />
                      Mark as Done
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => {
                        handleToggleComplete(
                          selectedTask.id,
                          selectedTask.status,
                        );
                        setSelectedTask(null);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-[var(--radius)] surface-2 hover:surface-3 font-medium transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Mark as Not Done
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => {
                      setSelectedTask(null);
                      handleStartEdit(selectedTask);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-[var(--radius)] bg-[hsl(var(--accent))] text-white font-medium shadow-lg shadow-[hsl(var(--accent)/0.3)] hover:opacity-90 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit2 className="inline h-4 w-4 mr-2" />
                    Edit Task
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--surface2));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--accent) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--accent) / 0.5);
        }
      `}</style>
    </Panel>
  );
}
