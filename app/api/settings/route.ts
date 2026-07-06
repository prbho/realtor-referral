// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { emailNotifications, marketingEmails } = await request.json();

    const updates: Record<string, boolean> = {};
    if (typeof emailNotifications === "boolean")
      updates.emailNotifications = emailNotifications;
    if (typeof marketingEmails === "boolean")
      updates.marketingEmails = marketingEmails;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes to save" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
    });

    return NextResponse.json({ success: true, message: "Preferences saved." });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Account/Session rows cascade-delete automatically (onDelete: Cascade in schema)
    await prisma.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
