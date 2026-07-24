import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json(
      { error: "Missing referral code" },
      { status: 400 }
    );
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateCheck = await checkRateLimit(`referrer-lookup:${ip}`);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }
  await recordAttempt(`referrer-lookup:${ip}`);

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { name: true },
  });

  if (!referrer) {
    return NextResponse.json(
      { error: "Invalid referral code" },
      { status: 404 }
    );
  }

  return NextResponse.json({ name: referrer.name });
}
