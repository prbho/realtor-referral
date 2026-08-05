import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { normalizePaidReferralCount } from "@/lib/commission";

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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { paidReferralCount: normalizedPaidReferralCount },
      select: { id: true, paidReferralCount: true },
    });

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
