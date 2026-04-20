import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = (process.env.DASHBOARD_ADMIN_PASSWORD || "gatekeeper-admin-secure").trim();

  if (password === adminPassword) {
    let customToken = null;
    let tokenError = null;
    try {
      customToken = await adminAuth.createCustomToken("gatekeeper-super-admin", { admin: true });
    } catch (e: any) {
      console.warn("Could not generate custom token:", e.message);
      tokenError = e.message;
    }

    const res = NextResponse.json({ success: true, customToken, tokenError });
    res.cookies.set("gk_admin_session", adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("gk_admin_session");
  return res;
}
