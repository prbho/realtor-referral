// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get("period") ?? "all";

    const now = new Date();
    let startDate: Date | null = null;

    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    // Fetch all users (or those with referrals if we want to filter)
    // We'll get all users and compute the count for the period
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        // For all-time we can use the stored count, for period we'll count referrals
        referralCount: true,
        referrals: {
          where: startDate ? { createdAt: { gte: startDate } } : {},
          select: { id: true },
        },
      },
    });

    // Build leaderboard entries
    const leaderboard = users.map((user) => {
      let count: number;
      if (period === "all") {
        count = user.referralCount;
      } else {
        count = user.referrals.length;
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        referralCount: count,
        allTimeReferralCount: user.referralCount,
      };
    });

    // Sort by referralCount descending (highest first)
    leaderboard.sort((a, b) => b.referralCount - a.referralCount);

    // ✅ Only keep users with at least 1 referral for week/month (optional)
    // If you want to show zeros, remove this filter.
    const filtered = startDate
      ? leaderboard.filter((u) => u.referralCount > 0)
      : leaderboard;

    // Take top 20
    const top20 = filtered.slice(0, 20);

    return NextResponse.json(top20);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
