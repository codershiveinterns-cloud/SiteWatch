import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "sw_session";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function ttlMs(): number {
  return env().SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
}

async function requestMeta(): Promise<{ userAgent: string | null; ipAddress: string | null }> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return {
    userAgent: h.get("user-agent")?.slice(0, 512) ?? null,
    ipAddress: forwarded ? forwarded.split(",")[0].trim().slice(0, 64) : null,
  };
}

/**
 * Creates a server-side session for the user inside the given organization
 * and writes the opaque token to an httpOnly cookie.
 */
export async function createSession(userId: string, organizationId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ttlMs());
  const meta = await requestMeta();

  await db.session.create({
    data: { tokenHash: hashToken(token), userId, organizationId, expiresAt, ...meta },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env().APP_URL.startsWith("https://"),
    path: "/",
    expires: expiresAt,
  });
}

export type ResolvedSession = NonNullable<Awaited<ReturnType<typeof resolveSession>>>;

/**
 * Resolves the current request's session from the cookie. Returns null when
 * the cookie is absent, unknown, or expired. Expired rows are removed lazily.
 */
export async function resolveSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: {
      user: { select: { id: true, email: true, name: true, createdAt: true } },
      organization: { select: { id: true, name: true, slug: true, timezone: true, createdAt: true } },
    },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  // Membership is the source of truth for the role; sessions never cache it,
  // so a role change by an admin takes effect on the next request.
  const membership = await db.membership.findUnique({
    where: { userId_organizationId: { userId: session.userId, organizationId: session.organizationId } },
    select: { id: true, role: true, createdAt: true },
  });
  if (!membership) return null;

  // Throttled activity tracking (at most once per 10 minutes per session).
  if (Date.now() - session.lastActiveAt.getTime() > 10 * 60 * 1000) {
    void db.session
      .update({ where: { id: session.id }, data: { lastActiveAt: new Date() } })
      .catch(() => undefined);
  }

  return { session, user: session.user, organization: session.organization, membership };
}

/** Revokes the current session (if any) and clears the cookie. */
export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** Revokes every other session belonging to the user (keeps the current one). */
export async function revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
  const result = await db.session.deleteMany({ where: { userId, NOT: { id: currentSessionId } } });
  return result.count;
}
