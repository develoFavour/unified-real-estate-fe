"use client";

import { useState } from "react";
import { Loader2, MessageSquareText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusNoteModalProps {
  isOpen: boolean;
  statusLabel: string;
  requestTitle?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
}

export function StatusNoteModal({
  isOpen,
  statusLabel,
  requestTitle,
  loading = false,
  onClose,
  onSubmit,
}: StatusNoteModalProps) {
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(note.trim());
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={loading ? undefined : onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl animate-in zoom-in duration-200"
      >
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquareText size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Update Maintenance Status</h3>
              <p className="text-xs text-gray-500">
                Marking {requestTitle || "this request"} as {statusLabel}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-7 space-y-2">
          <label className="pl-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
            Optional Note
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Add a short update for the tenant..."
            className="w-full resize-none rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white transition-all focus:border-primary/50 focus:outline-none"
          />
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-primary-hover disabled:opacity-60"
            )}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Save Update
          </button>
        </div>
      </form>
    </div>
  );
}
