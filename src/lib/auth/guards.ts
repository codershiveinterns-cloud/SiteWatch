import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { resolveSession, type ResolvedSession } from "./session";
import { hasPermission, type Permission, type Role } from "@/lib/rbac";

/**
 * Request-scoped auth context. `cache()` dedupes the database lookup across
 * layout, page and nested server components within a single request.
 */
export const getAuthContext = cache(async (): Promise<ResolvedSession | null> => resolveSession());

export type AuthContext = ResolvedSession & { role: Role };

/**
 * Requires an authenticated session. Redirects to the login page (preserving
 * the intended destination) when the session is missing or expired.
 */
export async function requireAuth(next?: string): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    // Route handler clears the stale cookie, then continues to /login.
    const params = new URLSearchParams();
    if (next && next.startsWith("/")) params.set("next", next);
    const qs = params.toString();
    redirect(`/api/auth/expired${qs ? `?${qs}` : ""}`);
  }
  return { ...ctx, role: ctx.membership.role };
}

/**
 * Requires a permission on top of authentication. Renders the in-app 403
 * page when the role lacks it — visiting a URL manually never grants access.
 */
export async function requirePermission(permission: Permission, next?: string): Promise<AuthContext> {
  const ctx = await requireAuth(next);
  if (!hasPermission(ctx.role, permission)) {
    redirect(`/forbidden?required=${encodeURIComponent(permission)}`);
  }
  return ctx;
}

/** Non-redirecting variant for server actions: throws a typed error instead. */
export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function assertPermission(permission: Permission): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new AuthorizationError("Your session has expired. Please sign in again.");
  const role = ctx.membership.role;
  if (!hasPermission(role, permission)) throw new AuthorizationError();
  return { ...ctx, role };
}
