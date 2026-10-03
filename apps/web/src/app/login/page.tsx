import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoginHero } from "@/features/auth/components/login-hero";

export const metadata: Metadata = {
  title: "Log in to Shoof",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-[minmax(0,1fr)] font-sans text-ink split:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <LoginHero />
      <div className="flex items-center justify-center bg-ground px-6 py-8 split:p-12">
        <LoginForm />
      </div>
    </main>
  );
}
