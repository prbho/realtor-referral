import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validation";
import { assertEmailCapacityAvailable } from "@/lib/systemSettings";
import { recordAttempt, checkRateLimit } from "@/lib/rateLimit";
import { sendContactEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const {
      toEmail: rawToEmail,
      realtorName,
      fromName,
      fromEmail: rawFromEmail,
      message,
    } = await request.json();

    const toEmail = rawToEmail?.trim().toLowerCase();
    const fromEmail = rawFromEmail?.trim().toLowerCase();
    const fromNameNormalized = fromName?.trim();
    const messageText = message?.trim();

    if (!toEmail || !isValidEmail(toEmail)) {
      return NextResponse.json(
        { error: "Invalid recipient email." },
        { status: 400 }
      );
    }

    if (!fromNameNormalized) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    if (!fromEmail || !isValidEmail(fromEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!messageText) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    try {
      await assertEmailCapacityAvailable();
    } catch (capacityError) {
      return NextResponse.json(
        {
          error:
            capacityError instanceof Error
              ? capacityError.message
              : "Email sending is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateCheck = await checkRateLimit(`realtor-contact:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${rateCheck.retryAfterMinutes} minutes.`,
        },
        { status: 429 }
      );
    }
    await recordAttempt(`realtor-contact:${ip}`);

    const realtor = await prisma.user.findUnique({ where: { email: toEmail } });
    if (!realtor || realtor.role !== "REALTOR") {
      return NextResponse.json(
        { error: "Realtor not found." },
        { status: 404 }
      );
    }

    const emailBody = `
      <p>You have received a new message from a potential client.</p>
      <p><strong>From:</strong> ${fromNameNormalized} &lt;${fromEmail}&gt;</p>
      <p><strong>For Realtor:</strong> ${realtorName}</p>
      <p><strong>Message:</strong></p>
      <p>${messageText.replace(/\n/g, "<br />")}</p>
      <p>If you need to reply, use the sender's email address above.</p>
    `;

    const subject = `New Realtor inquiry from ${fromNameNormalized}`;
    await sendContactEmail(toEmail, subject, emailBody);

    return NextResponse.json({ success: true, message: "Message sent." });
  } catch (error) {
    console.error("Realtor contact error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
