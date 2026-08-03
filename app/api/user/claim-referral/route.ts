import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { referralCode } = await request.json();
    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    const cleanCode = referralCode.trim().toUpperCase();

    // 1. Find the referrer by referral code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: cleanCode },
      select: { id: true, email: true, emailNotifications: true },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    // 2. Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referredBy: true, name: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Prevent claiming referral if already referred
    if (currentUser.referredBy) {
      return NextResponse.json(
        { error: "You already have a referrer" },
        { status: 400 }
      );
    }

    // 4. Prevent self-referral
    if (referrer.id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot refer yourself" },
        { status: 400 }
      );
    }

    // 5. Update user
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { referredBy: referrer.id },
      }),
      prisma.user.update({
        where: { id: referrer.id },
        data: { referralCount: { increment: 1 } },
      }),
    ]);

    // 6. Create notification for referrer
    await createNotification(
      referrer.id,
      "referral",
      `🎉 ${currentUser.name || "A new user"} claimed your referral!`,
      `/realtors/${session.user.id}`
    );

    // 7. (Optional) Send email notification if enabled
    if (referrer.emailNotifications) {
      // You can call sendReferralNotificationEmail here if needed
    }

    return NextResponse.json({ success: true, userName: currentUser.name });
  } catch (error) {
    console.error("Claim referral error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
