import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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

    const { userIds } = await request.json();
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds must be a non‑empty array" },
        { status: 400 }
      );
    }

    // Prevent deletion of self and any super admin
    const superAdmins = await prisma.user.findMany({
      where: { isSuperAdmin: true },
      select: { id: true },
    });
    const protectedIds = new Set([
      currentUser.id,
      ...superAdmins.map((u) => u.id),
    ]);

    const safeIds = userIds.filter((id) => !protectedIds.has(id));

    if (safeIds.length === 0) {
      return NextResponse.json(
        { error: "No valid users to delete" },
        { status: 400 }
      );
    }

    const result = await prisma.user.deleteMany({
      where: { id: { in: safeIds } },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
