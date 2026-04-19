import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Apply middleware only to protected dashboard paths and server actions
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  const adminPassword = process.env.DASHBOARD_ADMIN_PASSWORD;

  // If no password is set in the environment, we lock everything down completely 
  // to avoid exposing the system entirely by default.
  if (!adminPassword) {
    return new NextResponse("Authentication Misconfigured: DASHBOARD_ADMIN_PASSWORD is not set.", {
      status: 500,
    });
  }

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
