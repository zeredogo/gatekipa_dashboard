import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT count(*) FROM waitlist`;
    const count = parseInt(result[0].count);
    return NextResponse.json({ count, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
