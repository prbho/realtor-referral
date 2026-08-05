// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { calculateCommissionFromVerifiedCount } from "@/lib/commission";
import { getSystemSettings } from "@/lib/systemSettings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ─── Check admin status ──────────────────────────────────
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isSuperAdmin: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = await getSystemSettings();
    const commissionPerVerifiedReferral =
      settings.commissionPerVerifiedReferral;

    // Admin = role === "ADMIN" OR isSuperAdmin === true
    const isAdmin = currentUser.role === "ADMIN" || currentUser.isSuperAdmin;

    // ─── Fetch target user ───────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        ninVerified: true,
        createdAt: true,
        phone: isAdmin,
        whatsapp: isAdmin,
        city: isAdmin,
        state: isAdmin,
        country: isAdmin,
        streetAddress: isAdmin,
        apartment: isAdmin,
        zipCode: isAdmin,
        accountName: isAdmin,
        accountNumber: isAdmin,
        bankName: isAdmin,
        _count: {
          select: {
            referrals: true,
          },
        },
        referrals: {
          where: isAdmin ? {} : { id: undefined },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            ninVerified: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          // ✅ Remove take to fetch ALL referrals
        },
        // ✅ Include referrer with image
        ...(isAdmin && {
          referrer: {
            select: {
              id: true,
              name: true,
              image: true, // ✅ added avatar
            },
          },
        }),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ─── Non‑admin: only public fields ──────────────────────
    if (!isAdmin) {
      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        ninVerified: user.ninVerified,
        referralCount: user._count.referrals,
        createdAt: user.createdAt,
      });
    }

    // ─── Admin: full profile ──────────────────────────────────
    const { referrer, ...rest } = user;
    const response = {
      ...rest,
      referralCount: user._count.referrals,
      commission: calculateCommissionFromVerifiedCount(
        user.referrals.filter((referral) => referral.ninVerified).length,
        commissionPerVerifiedReferral
      ),
      referredBy: referrer || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
