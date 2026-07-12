// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { isValidEmail, isValidPassword, isValidNIN } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";

const OPTIONAL_TEXT_FIELDS = [
  "phone",
  "streetAddress",
  "apartment",
  "city",
  "state",
  "zipCode",
  "country",
  "accountName",
  "accountNumber",
  "bankName",
] as const;

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email: rawEmail, currentPassword, newPassword, nin } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    const messages: string[] = [];

    // --- Name update ---
    if (typeof name === "string" && name.trim() && name.trim() !== user.name) {
      updates.name = name.trim();
      messages.push("Name updated.");
    }

    // --- Email update ---
    if (typeof rawEmail === "string") {
      const email = rawEmail.trim().toLowerCase();
      if (email !== user.email) {
        if (!isValidEmail(email)) {
          return NextResponse.json(
            { error: "Please enter a valid email address" },
            { status: 400 }
          );
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return NextResponse.json(
            { error: "That email is already in use" },
            { status: 400 }
          );
        }

        updates.email = email;
        updates.emailVerified = null;

        const token = crypto.randomBytes(32).toString("hex");
        await prisma.verificationToken.deleteMany({
          where: { identifier: email },
        });
        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
        await sendVerificationEmail(email, token);

        messages.push(
          "Email updated. Please check your new inbox to verify it."
        );
      }
    }

    // --- NIN update ---
    if (typeof nin === "string" && nin.trim()) {
      const trimmedNin = nin.trim();

      if (!isValidNIN(trimmedNin)) {
        return NextResponse.json(
          { error: "NIN must be exactly 11 digits" },
          { status: 400 }
        );
      }

      if (trimmedNin !== user.nin) {
        const existingNin = await prisma.user.findUnique({
          where: { nin: trimmedNin },
        });
        if (existingNin && existingNin.id !== user.id) {
          return NextResponse.json(
            { error: "This NIN is already associated with another account" },
            { status: 400 }
          );
        }
        updates.nin = trimmedNin;
      }
    }

    // --- Optional profile / address / banking fields ---
    for (const field of OPTIONAL_TEXT_FIELDS) {
      if (field in body) {
        const raw = body[field];
        const value = typeof raw === "string" ? raw.trim() : raw;
        updates[field] = value === "" ? null : value;
      }
    }

    // --- Password change ---
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      if (!user.password) {
        return NextResponse.json(
          { error: "This account has no password set" },
          { status: 400 }
        );
      }

      const currentMatches = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!currentMatches) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const passwordCheck = isValidPassword(newPassword);
      if (!passwordCheck.valid) {
        return NextResponse.json(
          { error: passwordCheck.message },
          { status: 400 }
        );
      }

      updates.password = await bcrypt.hash(newPassword, 10);
      messages.push("Password updated.");
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes to save" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: messages.length > 0 ? messages.join(" ") : "Profile saved.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
