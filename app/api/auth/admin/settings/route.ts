// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getSystemSettings,
  updateSystemSettings,
  getEmailsSentToday,
} from "@/lib/systemSettings";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return { error: "Not authenticated", status: 401 as const };
  if (session.user.role !== "ADMIN")
    return { error: "Forbidden", status: 403 as const };
  return null;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.status }
    );
  }

  const settings = await getSystemSettings();
  const emailsSentToday = await getEmailsSentToday();

  return NextResponse.json({ settings, emailsSentToday });
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.status }
    );
  }

  try {
    const body = await request.json();
    const { emailLimitEnabled, emailDailyLimit } = body;

    const updates: { emailLimitEnabled?: boolean; emailDailyLimit?: number } =
      {};

    if (typeof emailLimitEnabled === "boolean") {
      updates.emailLimitEnabled = emailLimitEnabled;
    }

    if (typeof emailDailyLimit === "number") {
      if (emailDailyLimit < 1 || !Number.isInteger(emailDailyLimit)) {
        return NextResponse.json(
          { error: "Daily limit must be a positive whole number" },
          { status: 400 }
        );
      }
      updates.emailDailyLimit = emailDailyLimit;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes to save" },
        { status: 400 }
      );
    }

    const settings = await updateSystemSettings(updates);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("System settings update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
