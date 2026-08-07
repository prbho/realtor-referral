import { NextRequest, NextResponse } from "next/server";
import { runUnverifiedAccountCleanup } from "@/lib/unverifiedCleanup";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");

  if (headerSecret === secret) return true;
  if (authHeader === `Bearer ${secret}`) return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await runUnverifiedAccountCleanup(
    now,
    request.headers.get("x-forwarded-for"),
    request.headers.get("user-agent")
  );

  return NextResponse.json({
    success: true,
    runAt: now.toISOString(),
    ...result,
  });
}
