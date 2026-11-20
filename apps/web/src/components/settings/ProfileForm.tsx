/**
 * Display name, username and bio.
 *
 * Uses React 19 form actions + useActionState instead of controlled inputs:
 * the inputs stay uncontrolled, the action receives FormData, and pending/
 * error/success all come from the hook. The mock API rejects the username
 * "admin" (see lib/api.ts), to exercise the error path.
 */
"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

interface FormState {
  values: { displayName: string; username: string; bio: string };
  errors: Partial<Record<"displayName" | "username", string>>;
  message: { kind: "success" | "error"; text: string } | null;
}

export function ProfileForm({ user }: { user: UserProfile }) {
  const initialState: FormState = {
    values: {
      displayName: user.displayName,
      username: user.username,
      bio: user.bio,
    },
    errors: {},
    message: null,
  };

  const [state, formAction, pending] = useActionState(
    async (prev: FormState, formData: FormData): Promise<FormState> => {
      const values = {
        displayName: String(formData.get("displayName") ?? "").trim(),
        username: String(formData.get("username") ?? "").trim(),
        bio: String(formData.get("bio") ?? "").trim(),
      };

      const errors: FormState["errors"] = {};
      if (values.displayName.length < 2) {
        errors.displayName = "Display name needs at least 2 characters.";
      }
      if (!/^[a-z0-9_]{3,20}$/i.test(values.username)) {
        errors.username = "Username: 3–20 letters, digits or underscores.";
      }
      if (Object.keys(errors).length > 0) {
        return { values, errors, message: null };
      }

      try {
        const saved = await updateProfile(values);
        return {
          values: { ...values, ...saved },
          errors: {},
          message: { kind: "success", text: "Profile saved." },
        };
      } catch (error) {
        return {
          values,
          errors: {},
          message: {
            kind: "error",
            text: error instanceof Error ? error.message : "Something went wrong.",
          },
        };
      }
    },
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-base font-semibold">Profile</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        How you appear across CodeArena.
      </p>

      {state.message && (
        <p
          role="status"
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            state.message.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
          }`}
        >
          {state.message.text}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="displayName" className={labelClass}>
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue={state.values.displayName}
              className={inputClass}
            />
            {state.errors.displayName && (
              <p className={errorClass}>{state.errors.displayName}</p>
            )}
          </div>
          <div>
            <label htmlFor="username" className={labelClass}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue={state.values.username}
              className={`${inputClass} font-mono`}
            />
            {state.errors.username && (
              <p className={errorClass}>{state.errors.username}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={state.values.bio}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600";
const errorClass = "mt-1.5 text-xs text-rose-600 dark:text-rose-400";
