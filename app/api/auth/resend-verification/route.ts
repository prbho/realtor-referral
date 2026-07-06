// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { isValidEmail } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";
import { assertEmailCapacityAvailable } from "@/lib/systemSettings";

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

    try {
      await assertEmailCapacityAvailable();
    } catch (capacityError) {
      return NextResponse.json(
        {
          error:
            capacityError instanceof Error
              ? capacityError.message
              : "Email sending is temporarily unavailable. Please try again in 24 hours.",
        },
        { status: 503 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateCheck = await checkRateLimit(`resend-verification:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${rateCheck.retryAfterMinutes} minutes.`,
        },
        { status: 429 }
      );
    }
    await recordAttempt(`resend-verification:${ip}`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      const token = crypto.randomBytes(32).toString("hex");
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await sendVerificationEmail(email, token);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists and isn't yet verified, a new link has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
