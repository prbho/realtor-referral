// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import {
  sendVerificationEmail,
  sendReferralNotificationEmail,
} from "@/lib/email";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";
import { assertEmailCapacityAvailable } from "@/lib/systemSettings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email: rawEmail, password, role, referralCode } = body;
    const email = rawEmail?.trim().toLowerCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      );
    }

    // Check email sending capacity BEFORE creating the account — an account
    // that can't get a verification email is a dead end for the user.
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
    const rateCheck = await checkRateLimit(`register:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Try again in ${rateCheck.retryAfterMinutes} minutes.`,
        },
        { status: 429 }
      );
    }
    await recordAttempt(`register:${ip}`);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    let referredBy = null;
    if (referralCode) {
      const referrer = await prisma.user.findFirst({ where: { referralCode } });
      if (referrer) {
        referredBy = referrer.id;
        await prisma.user.update({
          where: { id: referrer.id },
          data: { referralCount: { increment: 1 } },
        });

        // Notify the referrer, respecting their notification preference.
        // This doesn't re-check email capacity — if it fails silently due to
        // limits, that's acceptable since it's not blocking, unlike verification.
        if (referrer.emailNotifications) {
          await sendReferralNotificationEmail(referrer.email, name);
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userReferralCode = generateReferralCode(name);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        referralCode: userReferralCode,
        referredBy,
      },
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

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created! Please check your email to verify your account before signing in.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Registration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
