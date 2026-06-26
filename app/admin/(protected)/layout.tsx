import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE_NAME = "__session";

// Real auth boundary for everything under /admin (except /admin/login, which
// has its own standalone layout-free page and isn't wrapped by this check —
// see the early return below). middleware.ts only does a fast cookie-presence
// redirect; this is where the session cookie is actually cryptographically
// verified and the `role === 'admin'` custom claim is checked.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    redirect("/admin/login");
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (decoded.role !== "admin") {
      redirect("/admin/login");
    }
  } catch (err) {
    console.error("Session verification failed", err);
    redirect("/admin/login");
  }

  return <>{children}</>;
}
