import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sessionSecret } from "./secret";

export const SESSION_COOKIE = "sw_session";

/**
 * Session cookie format: `<payload>.<signature>` where payload is a
 * base64url JSON `{ sid, uid, oid, exp }` and the signature is an HMAC-SHA256
 * over the payload. The database keeps a row per session (device list,
 * revocation, activity); the signature lets any server instance verify the
 * cookie without having issued it, which matters on hosts where instances do
 * not share a database file (see `src/lib/db.ts`).
 */
type Payload = { sid: string; uid: string; oid: string; exp: number };

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function encode(p: Payload): string {
  const payload = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(cookie: string): Payload | null {
  const dot = cookie.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = cookie.slice(0, dot);
  const signature = cookie.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<Payload>;
    if (typeof parsed.sid !== "string" || typeof parsed.uid !== "string" || typeof parsed.oid !== "string" || typeof parsed.exp !== "number") {
      return null;
    }
    return parsed as Payload;
  } catch {
    return null;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function ttlMs(): number {
  return env().SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Hosts with per-instance storage (Vercel + bundled SQLite) cannot share
 * session rows between instances, so a validly signed cookie whose row is
 * missing is re-materialised locally instead of rejected.
 */
function sessionRowsArePerInstance(): boolean {
  return Boolean(process.env.VERCEL) && env().DATABASE_URL.startsWith("file:");
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
 * and writes the signed session cookie.
 */
export async function createSession(userId: string, organizationId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMs());
  const sid = randomBytes(16).toString("base64url");
  const cookieValue = encode({ sid, uid: userId, oid: organizationId, exp: expiresAt.getTime() });
  const meta = await requestMeta();

  await db.session.create({
    data: { id: sid, tokenHash: hashToken(cookieValue), userId, organizationId, expiresAt, ...meta },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, cookieValue, {
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
 * the cookie is absent, tampered with, revoked, or expired.
 */
export async function resolveSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;

  const payload = decode(cookieValue);
  if (!payload || payload.exp <= Date.now()) return null;

  const tokenHash = hashToken(cookieValue);
  let session = await db.session.findUnique({ where: { id: payload.sid } });

  if (session && session.tokenHash !== tokenHash) return null;

  if (!session) {
    if (!sessionRowsArePerInstance()) return null;
    const meta = await requestMeta();
    session = await db.session
      .create({
        data: {
          id: payload.sid,
          tokenHash,
          userId: payload.uid,
          organizationId: payload.oid,
          expiresAt: new Date(payload.exp),
          ...meta,
        },
      })
      .catch(() => null);
    if (!session) return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  const [user, organization, membership] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { id: true, email: true, name: true, createdAt: true } }),
    db.organization.findUnique({
      where: { id: session.organizationId },
      select: { id: true, name: true, slug: true, timezone: true, createdAt: true },
    }),
    // Membership is the source of truth for the role; sessions never cache it,
    // so a role change by an admin takes effect on the next request.
    db.membership.findUnique({
      where: { userId_organizationId: { userId: session.userId, organizationId: session.organizationId } },
      select: { id: true, role: true, createdAt: true },
    }),
  ]);
  if (!user || !organization || !membership) return null;

  // Throttled activity tracking (at most once per 10 minutes per session).
  if (Date.now() - session.lastActiveAt.getTime() > 10 * 60 * 1000) {
    void db.session
      .update({ where: { id: session.id }, data: { lastActiveAt: new Date() } })
      .catch(() => undefined);
  }

  return { session, user, organization, membership };
}

/** Revokes the current session (if any) and clears the cookie. */
export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (cookieValue) {
    const payload = decode(cookieValue);
    if (payload) await db.session.deleteMany({ where: { id: payload.sid } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** Revokes every other session belonging to the user (keeps the current one). */
export async function revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
  const result = await db.session.deleteMany({ where: { userId, NOT: { id: currentSessionId } } });
  return result.count;
}
