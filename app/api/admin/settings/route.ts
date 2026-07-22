import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isSuperAdmin: true },
    });
    if (!user || (user.role !== "ADMIN" && !user.isSuperAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      return NextResponse.json({
        emailLimitEnabled: true,
        emailDailyLimit: 100,
        ninVerificationRequired: true,
        registrationPaused: false,
        registrationPauseReason: null,
        registrationPauseUntil: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isSuperAdmin: true },
    });
    if (!user || (user.role !== "ADMIN" && !user.isSuperAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      emailLimitEnabled,
      emailDailyLimit,
      ninVerificationRequired,
      registrationPaused,
      registrationPauseReason,
      registrationPauseUntil,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof emailLimitEnabled === "boolean")
      updateData.emailLimitEnabled = emailLimitEnabled;
    if (typeof emailDailyLimit === "number" && emailDailyLimit > 0)
      updateData.emailDailyLimit = emailDailyLimit;
    if (typeof ninVerificationRequired === "boolean")
      updateData.ninVerificationRequired = ninVerificationRequired;
    if (typeof registrationPaused === "boolean")
      updateData.registrationPaused = registrationPaused;
    if (typeof registrationPauseReason === "string")
      updateData.registrationPauseReason = registrationPauseReason || null;
    if (registrationPauseUntil !== undefined) {
      updateData.registrationPauseUntil = registrationPauseUntil
        ? new Date(registrationPauseUntil)
        : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const settings = await prisma.systemSettings.upsert({
      where: { id: "singleton" },
      update: updateData,
      create: {
        id: "singleton",
        emailLimitEnabled: true,
        emailDailyLimit: 100,
        ninVerificationRequired: true,
        registrationPaused: false,
        registrationPauseReason: null,
        registrationPauseUntil: null,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
      settings,
    });
  } catch (error) {
    console.error("PATCH settings error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
