"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckSquare,
  Target,
  Activity,
  FileText,
  Users,
  BookOpen,
  BarChart3,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Zap, label: "Command", href: "/command" },
  { icon: Calendar, label: "Today", href: "/today" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Activity, label: "Habits", href: "/habits" },
  { icon: FileText, label: "Reviews", href: "/reviews" },
  { icon: Users, label: "People", href: "/people" },
  { icon: BookOpen, label: "Learning", href: "/learning" },
  { icon: BarChart3, label: "Metrics", href: "/metrics" },
];

export function LeftRail() {
  const [expanded, setExpanded] = React.useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 200 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="fixed left-0 top-0 h-screen surface border-r border-[hsl(var(--border))] z-50 flex flex-col"
    >
      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/command" && pathname === "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] transition-all",
                "hover:bg-[hsl(var(--surface2))]",
                isActive &&
                  "bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))]",
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <motion.span
                initial={false}
                animate={{
                  opacity: expanded ? 1 : 0,
                  width: expanded ? "auto" : 0,
                }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
          <motion.span
            initial={false}
            animate={{
              opacity: expanded ? 1 : 0,
              width: expanded ? "auto" : 0,
            }}
            transition={{ duration: 0.15 }}
            className="text-xs text-subtle whitespace-nowrap overflow-hidden"
          >
            Synced
          </motion.span>
        </div>
      </div>
    </motion.aside>
  );
}
