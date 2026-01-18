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
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

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
  const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <>
      {/* Sign Out Confirmation Dialog */}
      {showSignOutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
          onClick={() => setShowSignOutConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative overflow-hidden rounded-[var(--radius-lg)] p-6 max-w-md w-full mx-4"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--surface1)) 0%, hsl(var(--surface2)) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 20px 60px hsl(var(--shadow) / 0.3)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--danger))] rounded-full blur-3xl"
                animate={{
                  x: [0, 50, 0],
                  y: [0, 30, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-[hsl(var(--danger)/0.1)]">
                  <LogOut className="h-6 w-6 text-[hsl(var(--danger))]" />
                </div>
                <h3 className="text-xl font-bold">Sign Out</h3>
              </div>

              <p className="text-muted mb-6">
                Are you sure you want to sign out? You'll need to sign in again
                to access your workspace.
              </p>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius)] surface-2 hover:surface-3 font-medium transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSignOut}
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius)] bg-[hsl(var(--danger))] text-white font-medium shadow-lg shadow-[hsl(var(--danger)/0.3)] hover:opacity-90 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

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

        {/* Sign Out Button */}
        <div className="p-2 border-t border-[hsl(var(--border))]">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] transition-all",
              "hover:bg-[hsl(var(--danger)/0.1)] hover:text-[hsl(var(--danger))]",
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <motion.span
              initial={false}
              animate={{
                opacity: expanded ? 1 : 0,
                width: expanded ? "auto" : 0,
              }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              Sign Out
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
