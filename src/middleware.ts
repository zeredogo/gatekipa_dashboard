import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export function middleware(req: NextRequest) {
  const session = req.cookies.get("gk_admin_session");
  const adminPassword = (process.env.DASHBOARD_ADMIN_PASSWORD || "gatekeeper-admin-secure").trim();

  // Validate session cookie
  if (session?.value === adminPassword) {
    return NextResponse.next();
  }

  // If this is an API route, return 401 JSON instead of an HTML redirect
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Redirect to login page for UI routes
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
