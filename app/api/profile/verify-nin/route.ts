import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { verifyNin } from "@/lib/monnify";
import { createNotification } from "@/lib/notifications";
import { calculateCommissionFromVerifiedCount } from "@/lib/commission";
import { getSystemSettings } from "@/lib/systemSettings";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { nin } = await request.json();
    if (!nin || typeof nin !== "string" || nin.trim().length === 0) {
      return NextResponse.json({ error: "NIN is required" }, { status: 400 });
    }

    const cleanNin = nin.trim();

    // ✅ Validate NIN format (11 digits)
    if (!/^\d{11}$/.test(cleanNin)) {
      return NextResponse.json(
        { error: "NIN must be exactly 11 digits" },
        { status: 400 }
      );
    }

    // 1. Get user with nin, role, and referrer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        nin: true,
        ninVerified: true,
        role: true,
        isSuperAdmin: true,
        name: true,
        referredBy: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.nin) {
      return NextResponse.json(
        {
          error:
            "You haven't saved a NIN in your profile. Please update your profile first.",
        },
        { status: 400 }
      );
    }

    if (user.nin !== cleanNin) {
      return NextResponse.json(
        {
          error:
            "The NIN you entered does not match your profile's NIN. Please update your NIN to match.",
        },
        { status: 400 }
      );
    }

    if (user.ninVerified) {
      return NextResponse.json(
        { error: "Your NIN has already been verified." },
        { status: 400 }
      );
    }

    // 2. Call Monnify
    const result = await verifyNin(cleanNin);

    if (!result.verified) {
      const errorMsg =
        result.error ||
        "Verification failed. Please check your NIN and try again.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const settings = await getSystemSettings();
    const commissionPerVerifiedReferral =
      settings.commissionPerVerifiedReferral;

    // 3. Prepare update data
    const updateData: { ninVerified: boolean; role?: "REALTOR" } = {
      ninVerified: true,
    };

    const wasPromoted = !user.isSuperAdmin && user.role === "USER";
    if (wasPromoted) {
      updateData.role = "REALTOR";
    }

    // 4. Update user and credit referrer exactly once on first successful verification.
    const updatedUser = await prisma.$transaction(async (transaction) => {
      const verifiedUser = await transaction.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: { id: true, role: true, ninVerified: true },
      });

      if (user.referredBy) {
        const verifiedReferralCount = await transaction.user.count({
          where: {
            referredBy: user.referredBy,
            ninVerified: true,
          },
        });

        await transaction.user.update({
          where: { id: user.referredBy },
          data: {
            commission: calculateCommissionFromVerifiedCount(
              verifiedReferralCount,
              commissionPerVerifiedReferral
            ),
          },
        });
      }

      return verifiedUser;
    });

    // ─── Create notifications ──────────────────────────────

    // 4a. Notify the user
    const userMessage = wasPromoted
      ? "🎉 Your NIN has been verified and you are now a Realtor!"
      : "✅ Your NIN has been successfully verified.";
    await createNotification(
      session.user.id,
      "milestone",
      userMessage,
      "/profile"
    );

    // 4b. Notify the referrer (if exists)
    if (user.referredBy) {
      const referrer = await prisma.user.findUnique({
        where: { id: user.referredBy },
        select: { emailNotifications: true },
      });

      if (referrer?.emailNotifications !== false) {
        const referrerMessage = wasPromoted
          ? `🏅 ${user.name || "Your referral"} has become a Realtor!`
          : `📋 ${user.name || "Your referral"} has verified their NIN.`;
        await createNotification(
          user.referredBy,
          "realtor",
          referrerMessage,
          `/realtors/${session.user.id}`
        );

        await createNotification(
          user.referredBy,
          "commission",
          `💰 You earned ₦${commissionPerVerifiedReferral.toLocaleString()} because ${
            user.name || "your referral"
          } verified their NIN.`,
          "/dashboard"
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "NIN verified successfully" +
        (updateData.role ? " and you are now a Realtor!" : ""),
      fullName: result.fullName,
      roleUpdated: !!updateData.role,
      newRole: updatedUser.role,
    });
  } catch (error) {
    console.error("Verify NIN error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
