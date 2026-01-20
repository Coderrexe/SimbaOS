"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCommand } from "@/lib/command-context";
import {
  Search,
  Plus,
  Target,
  CheckSquare,
  Calendar,
  Zap,
  Brain,
  Sparkles,
  Play,
  StickyNote,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { mode, setMode, setShowRightNow, selection } = useCommand();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Global commands
  const globalCommands: Command[] = [
    {
      id: "quick-note",
      label: "Quick Note (⌘B)",
      icon: StickyNote,
      action: () => {
        setOpen(false);
        // Trigger the quick note modal via keyboard event
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "b",
            metaKey: true,
            bubbles: true,
          }),
        );
      },
      category: "Create",
      keywords: ["note", "write", "capture", "thought", "idea"],
    },
    {
      id: "right-now",
      label: "Start Right Now Focus",
      icon: Zap,
      action: () => setShowRightNow(true),
      category: "Focus",
      keywords: ["focus", "work", "deep"],
    },
    {
      id: "mode-plan",
      label: "Switch to Plan Mode",
      icon: Brain,
      action: () => setMode("plan"),
      category: "Mode",
      keywords: ["plan", "organize"],
    },
    {
      id: "mode-execute",
      label: "Switch to Execute Mode",
      icon: Zap,
      action: () => setMode("execute"),
      category: "Mode",
      keywords: ["execute", "do", "work"],
    },
    {
      id: "mode-reflect",
      label: "Switch to Reflect Mode",
      icon: Sparkles,
      action: () => setMode("reflect"),
      category: "Mode",
      keywords: ["reflect", "review"],
    },
    {
      id: "new-task",
      label: "Create New Task",
      icon: Plus,
      action: () => console.log("Create task"),
      category: "Create",
      keywords: ["task", "todo", "new"],
    },
    {
      id: "new-project",
      label: "Create New Project",
      icon: Target,
      action: () => console.log("Create project"),
      category: "Create",
      keywords: ["project", "new"],
    },
  ];

  // Contextual commands based on selection
  const contextualCommands: Command[] = React.useMemo(() => {
    if (!selection.type) return [];

    return [
      {
        id: "edit-selected",
        label: `Edit ${selection.type}`,
        icon: CheckSquare,
        action: () => console.log("Edit", selection),
        category: "Selection",
      },
      {
        id: "delete-selected",
        label: `Delete ${selection.type}`,
        icon: CheckSquare,
        action: () => console.log("Delete", selection),
        category: "Selection",
      },
    ];
  }, [selection]);

  const allCommands = [...globalCommands, ...contextualCommands];

  const filteredCommands = React.useMemo(() => {
    if (!search) return allCommands;

    const query = search.toLowerCase();
    return allCommands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.category.toLowerCase().includes(query) ||
        cmd.keywords?.some((k) => k.includes(query)),
    );
  }, [search, allCommands]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setSearch("");
    }
  }, [open]);

  const handleSelect = (command: Command) => {
    command.action();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-2xl glass-strong rounded-[var(--radius-xl)] shadow-[var(--shadow3)] overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-[hsl(var(--border))]">
                <Search className="h-5 w-5 text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands or type to capture..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                />
                <kbd className="px-2 py-1 text-xs rounded bg-[hsl(var(--surface3))] text-muted font-mono">
                  ⌘K
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-muted text-sm">
                    No commands found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(
                      filteredCommands.reduce(
                        (acc, cmd) => {
                          if (!acc[cmd.category]) acc[cmd.category] = [];
                          acc[cmd.category].push(cmd);
                          return acc;
                        },
                        {} as Record<string, Command[]>,
                      ),
                    ).map(([category, commands]) => (
                      <div key={category}>
                        <div className="px-3 py-2 text-xs font-medium text-muted">
                          {category}
                        </div>
                        {commands.map((cmd) => {
                          const Icon = cmd.icon;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => handleSelect(cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] hover:bg-[hsl(var(--surface2))] transition-colors text-left"
                            >
                              <Icon className="h-4 w-4 text-muted" />
                              <span className="text-sm">{cmd.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Hints */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border-subtle))] text-xs text-subtle">
                <span>Mode: {mode}</span>
                <div className="flex gap-4">
                  <span>↑↓ navigate</span>
                  <span>↵ select</span>
                  <span>esc close</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
