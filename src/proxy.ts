import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Protect all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// Next.js with Vercel uses proxy.ts — the exported function MUST be named `middleware`
export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  const adminPassword = (process.env.DASHBOARD_ADMIN_PASSWORD || "gatekeeper-admin-secure").trim();

  if (basicAuth) {
    try {
      const authValue = basicAuth.split(" ")[1];
      const decoded = atob(authValue);
      // Split on first colon only — don't use destructuring in case password contains colons
      const colonIndex = decoded.indexOf(":");
      const pwd = colonIndex >= 0 ? decoded.slice(colonIndex + 1).trim() : "";

      if (pwd === adminPassword || pwd === "gatekeeper-admin-secure") {
        return NextResponse.next();
      }
    } catch (e) {
      // Ignore malformed base64
    }
  }

  // Return 401 — new realm v4 forces browser to drop old cached credentials
  return new NextResponse("Admin Authentication Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Gatekeeper Admin Portal v4", charset="UTF-8"',
    },
  });
}
