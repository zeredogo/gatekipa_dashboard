import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Apply middleware only to protected dashboard paths and server actions
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export function proxy(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  // If not set in Vercel, default to a temporary secure password so the user can easily get in.
  const adminPassword = process.env.DASHBOARD_ADMIN_PASSWORD || "gatekeeper-admin-secure";

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    // We only care about matching the password. Basic auth username is arbitrary here ("admin")
    if (pwd === adminPassword) {
      return NextResponse.next();
    }
  }

  // Request credentials
  return new NextResponse("Admin Authentication Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Gatekeeper Secure Admin", charset="UTF-8"',
    },
  });
}
