import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
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
      select: { id: true, role: true, isSuperAdmin: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // ─── Get target user with referrer info ──────────────────────
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isSuperAdmin: true,
        referredBy: true, // referrer ID
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.isSuperAdmin) {
      return NextResponse.json(
        { error: "Cannot delete a super admin" },
        { status: 403 }
      );
    }

    // ─── Decrement referrer's referralCount if there is a referrer ──
    if (targetUser.referredBy) {
      await prisma.user.update({
        where: { id: targetUser.referredBy },
        data: {
          referralCount: { decrement: 1 },
        },
      });
    }

    // ─── Delete the user ──────────────────────────────────────────
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
