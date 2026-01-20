"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickNoteModal({ isOpen, onClose }: QuickNoteModalProps) {
  const [content, setContent] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (response.ok) {
        setContent("");
        onClose();
        // Notify NotesPanel to refresh
        window.dispatchEvent(new Event("note-created"));
      }
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-[var(--radius-lg)] p-6"
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
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-[var(--radius)] hover:bg-[hsl(var(--surface2))] transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1">✨ Quick Note</h2>
              <p className="text-sm text-muted">
                Capture your thoughts instantly
              </p>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm resize-none"
              rows={6}
            />

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--surface2))] border border-[hsl(var(--border))]">
                  ⌘
                </kbd>{" "}
                +{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--surface2))] border border-[hsl(var(--border))]">
                  Enter
                </kbd>{" "}
                to save
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  className="px-4 py-2 rounded-[var(--radius)] surface-2 hover:surface-3 font-medium transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={!content.trim() || isSaving}
                  className="px-4 py-2 rounded-[var(--radius)] bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] text-white font-medium shadow-lg shadow-[hsl(var(--accent)/0.3)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Note"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
