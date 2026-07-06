// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { isValidEmail } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail } = await request.json();
    const email = rawEmail?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateCheck = await checkRateLimit(`forgot-password:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${rateCheck.retryAfterMinutes} minutes.`,
        },
        { status: 429 }
      );
    }
    await recordAttempt(`forgot-password:${ip}`);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success, even if no account exists,
    // so this endpoint can't be used to discover registered emails
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.verificationToken.create({
        data: {
          identifier: `reset:${email}`,
          token,
          expires: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
