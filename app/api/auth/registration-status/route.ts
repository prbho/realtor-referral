import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/systemSettings";

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({
      paused: settings.registrationPaused,
      reason: settings.registrationPauseReason,
      pauseUntil: settings.registrationPauseUntil?.toISOString() || null,
    });
  } catch (error) {
    console.error("Registration status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration status" },
      { status: 500 }
    );
  }
}
