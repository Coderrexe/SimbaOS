"use client";

import * as React from "react";
import { Panel } from "./Panel";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Trash2, Edit2, Check, X } from "lucide-react";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function NotesPanel() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState("");

  const fetchNotes = React.useCallback(async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Listen for new notes from quick capture
  React.useEffect(() => {
    const handleNewNote = () => fetchNotes();
    window.addEventListener("note-created", handleNewNote);
    return () => window.removeEventListener("note-created", handleNewNote);
  }, [fetchNotes]);

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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Panel
      title="📝 Notes"
      subtitle="Press ⌘B to capture thoughts instantly"
    >
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted">
            <StickyNote className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No notes yet</p>
            <p className="text-xs mt-1">Press ⌘B to create your first note</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group p-3 rounded-[var(--radius)] surface-2 hover:surface-3 transition-all"
                >
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-2 py-1 rounded-[var(--radius)] bg-[hsl(var(--background))] border border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] outline-none text-sm resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleSaveEdit(note.id)}
                          className="p-1 rounded-[var(--radius)] bg-[hsl(var(--success))] text-white hover:opacity-90"
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
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm whitespace-pre-wrap flex-1">
                          {note.content}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            onClick={() => handleStartEdit(note)}
                            className="p-1 rounded-[var(--radius)] hover:bg-[hsl(var(--border))]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(note.id)}
                            className="p-1 rounded-[var(--radius)] hover:bg-[hsl(var(--danger))] hover:text-white"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-xs text-muted">
                        {formatDate(note.createdAt)}
                      </p>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

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
