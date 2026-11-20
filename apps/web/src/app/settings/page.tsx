/**
 * Settings page (server component).
 *
 * ProfileForm and PasswordForm use React 19 form actions (useActionState)
 * with uncontrolled inputs; AuthForm uses controlled inputs instead.
 */
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { AvatarUploader } from "@/components/settings/AvatarUploader";
import { DeleteAccount } from "@/components/settings/DeleteAccount";

export const metadata: Metadata = { title: "Settings" };

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "avatar", label: "Avatar" },
  { id: "password", label: "Password" },
  { id: "danger", label: "Danger zone" },
] as const;

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Manage your account, appearance and security.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Anchor side-nav (sticky on desktop) */}
        <nav className="lg:w-44 lg:shrink-0">
          <ul className="flex gap-2 overflow-x-auto lg:sticky lg:top-20 lg:flex-col">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    section.id === "danger"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <section id="profile" className="scroll-mt-20">
            <ProfileForm user={user} />
          </section>
          <section id="avatar" className="scroll-mt-20">
            <AvatarUploader user={user} />
          </section>
          <section id="password" className="scroll-mt-20">
            <PasswordForm />
          </section>
          <section id="danger" className="scroll-mt-20">
            <DeleteAccount username={user.username} />
          </section>
        </div>
      </div>
    </div>
  );
}
