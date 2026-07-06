// app/api/settings/theme/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { theme } = await req.json();

    if (!theme || !["light", "dark", "system"].includes(theme)) {
      return NextResponse.json(
        { error: "Invalid theme preference" },
        { status: 400 }
      );
    }

    // Update user's theme preference in database
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { themePreference: theme },
    });

    return NextResponse.json({
      message: "Theme preference updated successfully",
      theme: user.themePreference,
    });
  } catch (error) {
    console.error("Failed to update theme:", error);
    return NextResponse.json(
      { error: "Failed to update theme preference" },
      { status: 500 }
    );
  }
}
