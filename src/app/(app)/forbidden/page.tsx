import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requireAuth } from "@/lib/auth/guards";
import { ROLE_META } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Access restricted" };

export default async function ForbiddenPage({ searchParams }: PageProps<"/forbidden">) {
  const ctx = await requireAuth("/dashboard");
  const params = await searchParams;
  const required = typeof params.required === "string" ? params.required : undefined;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-12 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-md border border-line bg-surface text-atrisk shadow-sm">
        <ShieldAlert className="size-5" aria-hidden />
      </div>
      <p className="font-mono text-xs text-ink-3">403</p>
      <h1 className="mt-1 text-xl font-semibold text-ink">You don&apos;t have access to this area</h1>
      <p className="mt-2 text-sm text-ink-2">
        Your role in {ctx.organization.name} is {ROLE_META[ctx.role].label}. This area needs a permission that role does not
        include. Ask an Admin if you think you should have it.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-ink-3">
        <RoleBadge role={ctx.role} />
        {required ? <span className="font-mono">requires {required}</span> : null}
      </div>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
