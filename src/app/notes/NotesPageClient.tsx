"use client";

import * as React from "react";
import { Panel } from "@/components/command/Panel";
import { QuickNoteModal } from "@/components/command/QuickNoteModal";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Trash2, Edit2, Check, X, Plus } from "lucide-react";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function NotesPageClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = React.useState<Note[]>(initialNotes);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState("");
  const [isQuickNoteOpen, setIsQuickNoteOpen] = React.useState(false);

  // Command+B keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsQuickNoteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for new notes
  React.useEffect(() => {
    const handleNewNote = async () => {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    };
    window.addEventListener("note-created", handleNewNote);
    return () => window.removeEventListener("note-created", handleNewNote);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const updated = await response.json();
        setNotes(notes.map((n) => (n.id === id ? updated : n)));
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-20">
      <div className="max-w-[1200px] mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📝 Notes</h1>
            <p className="text-muted">Capture and organize your thoughts</p>
          </div>
          <motion.button
            onClick={() => setIsQuickNoteOpen(true)}
            className="px-4 py-2 rounded-[var(--radius)] bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] text-white font-medium shadow-lg shadow-[hsl(var(--accent)/0.3)] hover:opacity-90 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="inline h-4 w-4 mr-2" />
            New Note (⌘B)
          </motion.button>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <Panel>
            <div className="text-center py-16 text-muted">
              <StickyNote className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No notes yet</p>
              <p className="text-sm">Press ⌘B to create your first note</p>
            </div>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group"
                >
                  <Panel className="h-full">
                    {editingId === note.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm resize-none"
                          rows={6}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleSaveEdit(note.id)}
                            className="flex-1 px-3 py-2 rounded-[var(--radius)] bg-[hsl(var(--success))] text-white hover:opacity-90"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Check className="inline h-4 w-4 mr-2" />
                            Save
                          </motion.button>
                          <motion.button
                            onClick={handleCancelEdit}
                            className="px-3 py-2 rounded-[var(--radius)] surface-2 hover:surface-3"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <p className="text-sm whitespace-pre-wrap flex-1 min-h-[100px]">
                            {note.content}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => handleStartEdit(note)}
                              className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--border))]"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(note.id)}
                              className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--danger))] hover:text-white"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-[hsl(var(--border))]">
                          <p className="text-xs text-muted">
                            {formatDate(note.createdAt)}
                          </p>
                        </div>
                      </>
                    )}
                  </Panel>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Quick Note Modal */}
      <QuickNoteModal
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
      />
    </div>
  );
}
