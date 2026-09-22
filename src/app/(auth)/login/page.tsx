import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

const NOTICES: Record<string, { tone: "info" | "success" | "error"; text: string }> = {
  expired: { tone: "info", text: "Your session has expired. Sign in again to continue." },
  "signed-out": { tone: "success", text: "You have been signed out." },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const reason = typeof params.reason === "string" ? params.reason : undefined;
  const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : undefined;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-2">Access your organization&apos;s monitoring console.</p>
      </div>
      <LoginForm next={next} notice={reason ? NOTICES[reason] : undefined} />
    </div>
  );
}
