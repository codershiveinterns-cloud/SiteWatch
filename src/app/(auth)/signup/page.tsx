import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create workspace" };

export default function SignupPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-ink">Create your workspace</h1>
        <p className="mt-1 text-sm text-ink-2">Set up an isolated organization for your sites, assets and team.</p>
      </div>
      <SignupForm />
    </div>
  );
}
