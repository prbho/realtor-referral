// app/api/cron/send-emails/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/email";
import { recordEmailSent } from "@/lib/systemSettings";
import { runUnverifiedAccountCleanup } from "@/lib/unverifiedCleanup";

export async function GET() {
  // Secure with a secret header (optional)
  const now = new Date();
  const pending = await prisma.scheduledEmail.findMany({
    where: {
      scheduledAt: { lte: now },
      status: "pending",
    },
    include: {
      template: true,
    },
    take: 50, // batch size
  });

  const results = [];
  for (const email of pending) {
    try {
      // Replace placeholders (if needed) – for now, send as is
      // For each recipient, we could personalize; but we'll send same email to all
      const recipientUsers = await prisma.user.findMany({
        where: { id: { in: email.recipients } },
        select: { email: true, name: true },
      });

      for (const user of recipientUsers) {
        // Replace placeholders: {{name}}, {{email}}
        let personalizedBody = email.body;
        let personalizedSubject = email.subject;
        // Replace {{name}} with user.name, {{email}} with user.email
        personalizedBody = personalizedBody.replace(
          /\{\{name\}\}/g,
          user.name || "User"
        );
        personalizedBody = personalizedBody.replace(
          /\{\{email\}\}/g,
          user.email
        );
        personalizedSubject = personalizedSubject.replace(
          /\{\{name\}\}/g,
          user.name || "User"
        );

        // Send email
        await sendContactEmail(
          user.email,
          personalizedSubject,
          personalizedBody
        );
        await recordEmailSent();
      }

      // Mark as sent
      await prisma.scheduledEmail.update({
        where: { id: email.id },
        data: { status: "sent", sentAt: new Date() },
      });
      results.push({ id: email.id, status: "sent" });
    } catch (error) {
      console.error("Failed to send scheduled email", email.id, error);
      await prisma.scheduledEmail.update({
        where: { id: email.id },
        data: { status: "failed" },
      });
      results.push({ id: email.id, status: "failed" });
    }
  }

  const cleanup = await runUnverifiedAccountCleanup(
    now,
    null,
    "cron/send-emails"
  );

  return NextResponse.json({ sent: results.length, cleanup });
}
