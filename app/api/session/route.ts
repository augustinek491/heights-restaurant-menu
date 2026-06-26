// Exchanges a Firebase client ID token (from the admin login page) for an
// HttpOnly session cookie via the Admin SDK's createSessionCookie. The
// middleware then verifies this cookie on every /admin/** request instead of
// trusting a client-readable token.

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE_NAME = "__session";
const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify the caller actually has the admin custom claim before minting a
    // session cookie for them.
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    return res;
  } catch (err) {
    console.error("Session exchange failed", err);
    return NextResponse.json({ error: "Session exchange failed" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
