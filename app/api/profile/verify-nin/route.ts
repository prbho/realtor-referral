import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { verifyNin } from "@/lib/monnify";

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

    // 1. Get user with nin and role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { nin: true, role: true, isSuperAdmin: true },
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
            "The NIN you entered does not match your profile's NIN. Please update your profile first.",
        },
        { status: 400 }
      );
    }

    const result = await verifyNin(cleanNin);

    if (!result.verified) {
      const errorMsg =
        result.error ||
        "Verification failed. Please check your NIN and try again.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // 2. Prepare update data
    const updateData: { ninVerified: boolean; role?: "REALTOR" } = {
      ninVerified: true,
    };

    // Only upgrade role if user is currently a regular USER (not ADMIN or already REALTOR)
    // Super admins should not be demoted or changed.
    if (!user.isSuperAdmin && user.role === "USER") {
      updateData.role = "REALTOR";
    }

    // 3. Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, role: true, ninVerified: true },
    });

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
