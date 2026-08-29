/**
 * src/app/login/page.tsx — Sign in route
 * TODOs: none here — the practice gaps live in components/auth/AuthForm.tsx.
 */
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <AuthForm mode="login" />
    </div>
  );
}
