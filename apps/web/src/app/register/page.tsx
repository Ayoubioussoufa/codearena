/**
 * Registration page.
 */
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <AuthForm mode="register" />
    </div>
  );
}
