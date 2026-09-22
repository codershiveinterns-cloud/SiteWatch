import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Clears an invalid/expired session cookie and sends the visitor to the
 * login page. Layouts cannot modify cookies, so `requireAuth()` redirects
 * here instead of straight to /login — otherwise the stale cookie would keep
 * the proxy bouncing the user back into the app.
 */
export function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("reason", "expired");
  if (next && next.startsWith("/") && !next.startsWith("//")) url.searchParams.set("next", next);

  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
