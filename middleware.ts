import { NextRequest, NextResponse } from "next/server";

// Edge middleware can't use firebase-admin directly (no Node runtime APIs),
// so this delegates verification to a Node-runtime route and just checks
// cookie *presence* here, redirecting obviously-unauthenticated visitors
// away from /admin/**. The actual cryptographic verification + role check
// happens in app/admin/layout.tsx (a Node-runtime server component) on every
// request, which is the real security boundary — this middleware is a fast
// best-effort gate only.

const SESSION_COOKIE_NAME = "__session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get(SESSION_COOKIE_NAME);
    if (!cookie) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
