// app/api/admin/email-templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET all templates
export async function GET() {
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

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(templates);
}

// POST – create or update a template
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
  const { id, name, subject, body: htmlBody, variables } = body;

  if (id) {
    // Update existing
    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: { name, subject, body: htmlBody, variables },
    });
    return NextResponse.json(updated);
  } else {
    // Create new
    const created = await prisma.emailTemplate.create({
      data: { name, subject, body: htmlBody, variables },
    });
    return NextResponse.json(created);
  }
}

// DELETE a template
export async function DELETE(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.emailTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
