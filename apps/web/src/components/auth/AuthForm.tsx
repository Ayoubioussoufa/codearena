/**
 * Shared login / register form: controlled inputs, client-side validation
 * with per-field errors, and submission through useLogin / useRegister
 * (TanStack mutations).
 *
 * The refresh token never appears here: it arrives as an httpOnly cookie the
 * browser stores and sends on its own. Only the access token comes back in
 * the body, and it is kept in memory. See docs/adr/004-*.md.
 */
'use client';

import { useLogin, useRegister } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

/** Validation errors, one message per field. */
export type FieldErrors = Partial<
  Record<'username' | 'email' | 'password' | 'confirmPassword', string>
>;

// A "simple shape check": something@something.something. Deliberately loose —
// real email validation is the server's job, this just catches typos.
const EMAIL_RE = /\S+@\S+\.\S+/;

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === 'register';
  const router = useRouter();

  // ── #1 controlled inputs: one state per field, bound via value + onChange ──
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── #2 per-field errors: ONE object, key per field (empty = no error) ──
  const [errors, setErrors] = useState<FieldErrors>({});

  // ── #3 form-level state: API rejection banner ──
  const [formError, setFormError] = useState<string | null>(null);

  // The mutation owns the pending flag now — no hand-rolled `submitting`
  // boolean, and no try/finally to remember to reset it.
  const login = useLogin();
  const register = useRegister();
  const submitting = login.isPending || register.isPending;

  // Clear one field's error as the user fixes it (updater form + spread so the
  // other fields' errors survive). Returns a change handler for that field.
  function bind(
    setValue: (v: string) => void,
    field: keyof FieldErrors,
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    // #2 — run EVERY rule (no early return), collecting failures per field.
    const next: FieldErrors = {};
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.';
    // Matches RegisterDto's @MinLength(12). Client validation must not be
    // LOOSER than the server's, or the user gets a 400 they can't explain.
    if (isRegister && password.length < 12)
      next.password = 'Password must be at least 12 characters.';
    if (!isRegister && password.length === 0)
      next.password = 'Enter your password.';
    if (isRegister) {
      if (username.length < 3 || username.length > 20)
        next.username = 'Username must be 3–20 characters.';
      if (confirmPassword !== password)
        next.confirmPassword = "Passwords don't match.";
    }

    setErrors(next);
    setFormError(null);
    // Any key present → at least one field failed → stop before the network.
    if (Object.keys(next).length > 0) return;

    // #3 — the real API. Register then log in, so a new user lands signed in.
    try {
      if (isRegister) {
        await register.mutateAsync({ email, username, password });
      }
      await login.mutateAsync({ email, password });
      router.push('/problems');
    } catch (err) {
      // The API returns one message for every credential failure on purpose —
      // telling the user WHICH half was wrong would tell an attacker which
      // emails are registered. Show it as-is.
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {isRegister
            ? 'Join the arena and start your climb.'
            : 'Sign in to continue your streak.'}
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <FormBanner message={formError} />

        {isRegister && (
          <div>
            <label htmlFor="username" className={labelClass}>
              Username
            </label>
            <input
              value={username}
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="grace_hopper"
              className={inputClass}
              onChange={bind(setUsername, 'username')}
            />
            <FieldError message={errors.username} />
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            value={email}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
            onChange={bind(setEmail, 'email')}
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            value={password}
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            className={inputClass}
            onChange={bind(setPassword, 'password')}
          />
          <FieldError message={errors.password} />
        </div>

        {isRegister && (
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm password
            </label>
            <input
              value={confirmPassword}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass}
              onChange={bind(setConfirmPassword, 'confirmPassword')}
            />
            <FieldError message={errors.confirmPassword} />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? 'Please wait…'
            : isRegister
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {isRegister ? 'Already have an account? ' : 'New to CodeArena? '}
        <Link
          href={isRegister ? '/login' : '/register'}
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          {isRegister ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </div>
  );
}

/* ── Presentational helpers (complete — use them, don't rebuild them) ── */

const labelClass =
  'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600';

/** Renders nothing when message is empty — safe to keep in the JSX permanently. */
function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{message}</p>
  );
}

/** Form-level banner (e.g. API rejection). Renders nothing when message is null. */
function FormBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
    >
      {message}
    </div>
  );
}
