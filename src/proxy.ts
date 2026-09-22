import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "sw_session";
const PUBLIC_PATHS = new Set(["/login", "/signup"]);

/**
 * Optimistic routing layer only. It keeps unauthenticated visitors out of the
 * app shell and signed-in users off the auth pages based on cookie presence.
 * Real authentication and authorization happen server-side in
 * `src/lib/auth/guards.ts`, which validates the session against the database
 * on every request.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!hasSessionCookie && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (hasSessionCookie && (isPublic || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-sw-pathname", `${pathname}${search}`);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)"],
};
