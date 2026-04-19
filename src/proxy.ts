import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export function proxy(req: NextRequest) {
  const session = req.cookies.get("gk_admin_session");
  const adminPassword = (process.env.DASHBOARD_ADMIN_PASSWORD || "gatekeeper-admin-secure").trim();

  // Validate session cookie
  if (session?.value === adminPassword) {
    return NextResponse.next();
  }

  // Redirect to login page
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
