// app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  calculateCommissionFromVerifiedCount,
  calculatePaidCommission,
  calculateRemainingCommission,
} from "@/lib/commission";
import { getSystemSettings } from "@/lib/systemSettings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        paidReferralCount: true,
        referrals: {
          select: {
            id: true,
            role: true,
            ninVerified: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = await getSystemSettings();
    const commissionPerVerifiedReferral =
      settings.commissionPerVerifiedReferral;

    const totalReferrals = user.referrals.length;
    const realtorCount = user.referrals.filter(
      (r) => r.role === "REALTOR"
    ).length;
    const ninVerifiedCount = user.referrals.filter((r) => r.ninVerified).length;
    const emailVerifiedCount = user.referrals.filter(
      (r) => r.emailVerified
    ).length;

    // Conversion rate
    const conversionRate =
      totalReferrals > 0 ? (realtorCount / totalReferrals) * 100 : 0;

    // Funnel
    const funnel = {
      registered: totalReferrals,
      emailVerified: emailVerifiedCount,
      ninVerified: ninVerifiedCount,
      realtor: realtorCount,
    };

    const grossCommission = calculateCommissionFromVerifiedCount(
      ninVerifiedCount,
      commissionPerVerifiedReferral
    );
    const paidCommission = calculatePaidCommission(
      user.paidReferralCount,
      ninVerifiedCount,
      commissionPerVerifiedReferral
    );
    const remainingCommission = calculateRemainingCommission(
      ninVerifiedCount,
      user.paidReferralCount,
      commissionPerVerifiedReferral
    );

    // Monthly timeline (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData: { month: string; count: number }[] = [];

    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(sixMonthsAgo);
      monthStart.setMonth(sixMonthsAgo.getMonth() + i);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthStart.getMonth() + 1);

      const count = user.referrals.filter(
        (r) => r.createdAt >= monthStart && r.createdAt < monthEnd
      ).length;

      monthlyData.push({
        month: monthStart.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        count,
      });
    }

    return NextResponse.json({
      conversionRate: Math.round(conversionRate * 100) / 100,
      funnel,
      grossCommission,
      paidCommission,
      remainingCommission,
      monthlyData,
      totalReferrals,
      realtorCount,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
