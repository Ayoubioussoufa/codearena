/**
 * src/components/settings/PasswordForm.tsx — change password
 * TODOs: none — complete REFERENCE implementation (React 19 useActionState;
 * same idiom as ProfileForm). React resets the uncontrolled fields after a
 * successful action, which conveniently clears the password inputs.
 * Try current password "wrongpass" to see the API-error path.
 */
"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/api";

interface FormState {
  errors: Partial<Record<"currentPassword" | "newPassword" | "confirm", string>>;
  message: { kind: "success" | "error"; text: string } | null;
}

const initialState: FormState = { errors: {}, message: null };

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (prev: FormState, formData: FormData): Promise<FormState> => {
      const currentPassword = String(formData.get("currentPassword") ?? "");
      const newPassword = String(formData.get("newPassword") ?? "");
      const confirm = String(formData.get("confirm") ?? "");

      const errors: FormState["errors"] = {};
      if (currentPassword.length === 0) {
        errors.currentPassword = "Enter your current password.";
      }
      if (newPassword.length < 8) {
        errors.newPassword = "New password needs at least 8 characters.";
      }
      if (confirm !== newPassword) {
        errors.confirm = "Passwords don't match.";
      }
      if (Object.keys(errors).length > 0) {
        return { errors, message: null };
      }

      try {
        await changePassword({ currentPassword, newPassword });
        return {
          errors: {},
          message: { kind: "success", text: "Password updated." },
        };
      } catch (error) {
        return {
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
      <h2 className="text-base font-semibold">Password</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Use at least 8 characters. You&apos;ll stay signed in on this device.
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
        <div>
          <label htmlFor="currentPassword" className={labelClass}>
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            className={inputClass}
          />
          {state.errors.currentPassword && (
            <p className={errorClass}>{state.errors.currentPassword}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="newPassword" className={labelClass}>
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass}
            />
            {state.errors.newPassword && (
              <p className={errorClass}>{state.errors.newPassword}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirm" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className={inputClass}
            />
            {state.errors.confirm && (
              <p className={errorClass}>{state.errors.confirm}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
const errorClass = "mt-1.5 text-xs text-rose-600 dark:text-rose-400";
