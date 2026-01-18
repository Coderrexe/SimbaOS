"use client";

import { CommandProvider } from "@/lib/command-context";
import { LeftRail } from "@/components/command/LeftRail";
import { RightInspector } from "@/components/command/RightInspector";
import { CommandBar } from "@/components/command/CommandBar";
import { CommandPalette } from "@/components/command/CommandPalette";

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommandProvider>
      <div className="min-h-screen noise-bg">
        <LeftRail />
        <main className="ml-16">{children}</main>
        <RightInspector />
        <CommandBar />
        <CommandPalette />
      </div>
    </CommandProvider>
  );
}
