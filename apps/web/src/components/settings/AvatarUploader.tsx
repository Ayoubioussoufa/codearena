/**
 * src/components/settings/AvatarUploader.tsx — profile picture picker
 * TODOs: none — ref picker, image/size validation, and object-URL cleanup.
 * The card, <Avatar> preview slot, buttons and hidden file input are all in
 * place — the wiring is yours. This skill is deliberately different from the
 * other form work: DOM refs, the File API and object-URL lifecycle.
 */
"use client";

import type { UserProfile } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { useRef, useState, useEffect } from "react";

export function AvatarUploader({ user }: { user: UserProfile }) {
  const reference = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  // Revoke the object URL whenever it changes (a new preview replaced the old
  // one) and on unmount — no leaked blob: URLs.
  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setMessage('Please choose an image file.');
      return;
    }
    if (selected.size > 2_000_000) {
      setMessage('Image must be under 2 MB.');
      return;
    }

    setMessage('');
    setUrl(URL.createObjectURL(selected));
    event.target.value = '';
  }

  function handleRemove() {
    setUrl('');
    setMessage('');
    if (reference.current) reference.current.value = '';
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold">Avatar</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        PNG, JPG or GIF — up to 2 MB.
      </p>

      <div className="mt-5 flex items-center gap-5">
        <Avatar name={user.displayName} src={url || user.avatarUrl} size="lg" />

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => reference.current?.click()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Upload new
            </button>
            <button
              onClick={handleRemove}
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Remove
            </button>
          </div>
          <ErrorNote message={message || null} />
        </div>
      </div>

      <input
        type="file"
        onChange={handleFileChange}
        ref={reference}
        accept="image/*"
        className="hidden"
        aria-label="Choose avatar image"
      />
    </div>
  );
}

/* ── Presentational helper (complete) ── */

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-xs text-rose-600 dark:text-rose-400">{message}</p>;
}
