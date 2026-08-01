// app/api/admin/emails/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isSuperAdmin: true },
  });
  if (!user || (user.role !== "ADMIN" && !user.isSuperAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { templateId, subject, body: htmlBody, recipients, scheduledAt } = body;

  // Validate recipients
  if (!recipients || recipients.length === 0) {
    return NextResponse.json(
      { error: "At least one recipient required" },
      { status: 400 }
    );
  }

  // If templateId provided, fetch template and override subject/body if not provided
  let finalSubject = subject;
  let finalBody = htmlBody;
  if (templateId) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }
    if (!finalSubject) finalSubject = template.subject;
    if (!finalBody) finalBody = template.body;
  }

  if (!finalSubject || !finalBody) {
    return NextResponse.json(
      { error: "Subject and body are required" },
      { status: 400 }
    );
  }

  const scheduledEmail = await prisma.scheduledEmail.create({
    data: {
      templateId: templateId || null,
      subject: finalSubject,
      body: finalBody,
      recipients,
      scheduledAt: new Date(scheduledAt),
      status: "pending",
    },
  });

  return NextResponse.json(scheduledEmail);
}
