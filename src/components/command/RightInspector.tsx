"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Activity, FileText, Clock } from "lucide-react";
import { useCommand } from "@/lib/command-context";
import { Surface } from "./Surface";

const tabs = [
  { id: "details", label: "Details", icon: FileText },
  { id: "links", label: "Links", icon: Link2 },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "history", label: "History", icon: Clock },
];

export function RightInspector() {
  const { selection, setSelection } = useCommand();
  const [activeTab, setActiveTab] = React.useState("details");
  const isOpen = selection.type !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed right-0 top-0 h-screen w-[400px] surface-2 border-l border-[hsl(var(--border))] z-40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border-subtle))]">
            <div>
              <h2 className="text-sm font-semibold capitalize">
                {selection.type}
              </h2>
              <p className="text-xs text-muted mt-0.5">ID: {selection.id}</p>
            </div>
            <button
              onClick={() => setSelection({ type: null, id: null })}
              className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--surface3))] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-2 border-b border-[hsl(var(--border-subtle))]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))]"
                      : "text-muted hover:bg-[hsl(var(--surface3))]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <InspectorContent
              type={selection.type}
              id={selection.id}
              tab={activeTab}
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function InspectorContent({
  type,
  id,
  tab,
}: {
  type: string | null;
  id: string | null;
  tab: string;
}) {
  if (!type || !id) return null;

  // This would fetch actual data based on type and id
  // For now, showing placeholder
  return (
    <div className="space-y-4">
      <Surface className="p-4">
        <h3 className="text-sm font-medium mb-2">Loading {type} details...</h3>
        <p className="text-xs text-muted">
          Inspector content for {type} #{id} - {tab} tab
        </p>
      </Surface>
    </div>
  );
}
