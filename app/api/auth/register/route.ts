import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import {
  sendReferralNotificationEmail,
  sendVerificationEmail,
} from "@/lib/email";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";
import {
  assertEmailCapacityAvailable,
  getSystemSettings,
} from "@/lib/systemSettings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email: rawEmail, password, referralCode } = body;
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

    const settings = await getSystemSettings();
    const registrationPaused =
      settings.registrationPaused &&
      (!settings.registrationPauseUntil ||
        settings.registrationPauseUntil > new Date());

    if (registrationPaused) {
      return NextResponse.json(
        {
          error: "Registration is currently paused.",
          pauseReason: settings.registrationPauseReason,
          pauseUntil: settings.registrationPauseUntil?.toISOString() || null,
        },
        { status: 503 }
      );
    }

    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
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

    const normalizedReferralCode =
      typeof referralCode === "string"
        ? referralCode.trim().toUpperCase()
        : null;
    const referrer = normalizedReferralCode
      ? await prisma.user.findUnique({
          where: { referralCode: normalizedReferralCode },
          select: {
            id: true,
            email: true,
            emailNotifications: true,
          },
        })
      : null;

    const hashedPassword = await bcrypt.hash(password, 10);
    const userReferralCode = generateReferralCode(name);
    const token = crypto.randomBytes(32).toString("hex");

    await prisma.$transaction(async (transaction) => {
      await transaction.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
          referralCode: userReferralCode,
          referredBy: referrer?.id ?? null,
        },
      });

      if (referrer) {
        await transaction.user.update({
          where: { id: referrer.id },
          data: { referralCount: { increment: 1 } },
        });
      }

      await transaction.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    });

    if (referrer?.emailNotifications) {
      void sendReferralNotificationEmail(referrer.email, name).catch(
        (error) => {
          console.error("Referral notification email failed", error);
        }
      );
    }

    try {
      await sendVerificationEmail(email, token);
    } catch (error) {
      console.error("Verification email failed after registration", error);
      return NextResponse.json(
        {
          success: true,
          message:
            "Account created, but we could not send the verification email. Please use the resend verification option.",
        },
        { status: 201 }
      );
    }

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
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
