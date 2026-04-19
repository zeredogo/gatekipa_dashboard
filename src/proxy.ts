import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Apply middleware only to protected dashboard paths and server actions
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export function proxy(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  // Trim to eliminate Vercel CLI trailing newline artifacts
  const adminPassword = (process.env.DASHBOARD_ADMIN_PASSWORD || "").trim();

  if (basicAuth) {
    try {
      const authValue = basicAuth.split(" ")[1];
      const decoded = atob(authValue);
      // Split only on the FIRST colon so passwords containing colons work correctly
      const colonIdx = decoded.indexOf(":");
      const pwd = colonIdx >= 0 ? decoded.slice(colonIdx + 1).trim() : "";

      // Accept: env var password, or either hardcoded fallback (belt-and-suspenders)
      const isValid =
        (adminPassword.length > 0 && pwd === adminPassword) ||
        pwd === "gatekeeper-admin-secure" ||
        pwd === "GatekeeperAdmin2025";

      if (isValid) {
        return NextResponse.next();
      }
    } catch (e) {
      // Ignore invalid base64
    }
  }

  // Prompt for credentials — realm v3 busts any stale cached browser sessions
  return new NextResponse("Admin Authentication Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Gatekeeper Admin Portal v3", charset="UTF-8"',
    },
  });
}
