import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { normalizePaidReferralCount } from "@/lib/commission";
import { logAction } from "@/lib/auditLog";
import { getSystemSettings } from "@/lib/systemSettings";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isSuperAdmin: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const paidReferralCount = Number(body?.paidReferralCount);
    const actionType =
      body?.actionType === "pay" || body?.actionType === "adjustment"
        ? body.actionType
        : "adjustment";

    if (!Number.isInteger(paidReferralCount) || paidReferralCount < 0) {
      return NextResponse.json(
        {
          error:
            "Paid verified referral count must be a non-negative whole number.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        paidReferralCount: true,
        referrals: {
          where: { ninVerified: true },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const verifiedReferralCount = user.referrals.length;
    const normalizedPaidReferralCount = normalizePaidReferralCount(
      paidReferralCount,
      verifiedReferralCount
    );

    const settings = await getSystemSettings();
    const commissionPerVerifiedReferral =
      settings.commissionPerVerifiedReferral;
    const previousPaidReferralCount = user.paidReferralCount;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { paidReferralCount: normalizedPaidReferralCount },
      select: { id: true, paidReferralCount: true },
    });

    await logAction(
      session.user.id,
      "COMMISSION_UPDATE",
      {
        actionType: actionType === "pay" ? "PAY" : "ADJUSTMENT",
        targetUserId: user.id,
        targetEmail: user.email,
        targetName: user.name,
        verifiedReferralCount,
        previousPaidReferralCount,
        newPaidReferralCount: updatedUser.paidReferralCount,
        paidReferralDelta:
          updatedUser.paidReferralCount - previousPaidReferralCount,
        commissionPerVerifiedReferral,
        previousPaidCommission:
          previousPaidReferralCount * commissionPerVerifiedReferral,
        newPaidCommission:
          updatedUser.paidReferralCount * commissionPerVerifiedReferral,
      },
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        undefined,
      request.headers.get("user-agent") ?? undefined
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
      verifiedReferralCount,
    });
  } catch (error) {
    console.error("Update paid commission error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
