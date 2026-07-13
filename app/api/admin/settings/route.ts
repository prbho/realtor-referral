// app/api/admin/settings/route.ts
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

    // Check if user is admin - add this if you have a role field
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   select: { role: true },
    // });
    // if (user?.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { emailLimitEnabled, emailDailyLimit } = await request.json();

    // Validate input
    if (typeof emailLimitEnabled !== "boolean") {
      return NextResponse.json(
        { error: "emailLimitEnabled must be a boolean" },
        { status: 400 }
      );
    }

    if (typeof emailDailyLimit !== "number" || emailDailyLimit < 1) {
      return NextResponse.json(
        { error: "emailDailyLimit must be a number greater than 0" },
        { status: 400 }
      );
    }

    // Get or create system settings
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.systemSettings.create({
        data: {
          emailLimitEnabled,
          emailDailyLimit,
        },
      });
    } else {
      // Update existing
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          emailLimitEnabled,
          emailDailyLimit,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
      settings,
    });
  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to fetch settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin (optional)
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   select: { role: true },
    // });
    // if (user?.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Return defaults if no settings exist
      return NextResponse.json({
        emailLimitEnabled: true,
        emailDailyLimit: 100,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Admin settings fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
