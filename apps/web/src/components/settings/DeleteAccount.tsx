/**
 * Danger zone: account deletion behind a confirmation dialog.
 */
"use client";

import { deleteAccount } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

export function DeleteAccount({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  function handleClose() {
    if (deleting) return;
    setOpen(false);
    setDeleting(false);
    setConfirmText('');
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 dark:border-rose-500/30 dark:bg-rose-500/5">
      <h2 className="text-base font-semibold text-rose-700 dark:text-rose-400">
        Danger zone
      </h2>
      <p className="mt-1 max-w-lg text-sm text-slate-600 dark:text-slate-400">
        Deleting your account removes your submissions, rating history and
        contest results. This cannot be undone.
      </p>
      <button
        onClick={() => setOpen(true)}
        type="button"
        className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
      >
        Delete account
      </button>

      <DangerDialog
        open={open}
        onClose={handleClose}
        title="Delete your account?"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This is permanent. Type <strong>{username}</strong> to confirm.
        </p>
        <input
          disabled={deleting}
          aria-label="Type your username to confirm"
          onChange={(e) => setConfirmText(e.target.value)}
          type="text"
          value={confirmText}
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmText !== username || deleting}
            onClick={async () => {
              setDeleting(true);
              await deleteAccount();
              router.push("/");
            }}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </DangerDialog>
    </div>
  );
}

/* ── Presentational modal (complete — control it via props) ── */

export interface DangerDialogProps {
  open: boolean;
  title: string;
  /** Called on backdrop click and on the Cancel button. */
  onClose: () => void;
  children: ReactNode;
}

export function DangerDialog({ open, title, onClose, children }: DangerDialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <h3 className="text-base font-semibold text-rose-700 dark:text-rose-400">
          {title}
        </h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
