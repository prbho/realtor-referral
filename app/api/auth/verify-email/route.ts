// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function redirectTo(path: string) {
  // Build the redirect from NEXTAUTH_URL instead of request.url — behind a
  // reverse proxy, request.url reflects the internal Host header the app
  // sees (e.g. localhost:3000), not the public-facing domain.
  const base = process.env.NEXTAUTH_URL || "";
  return NextResponse.redirect(new URL(path, base));
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return redirectTo("/login?error=InvalidToken");
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return redirectTo("/login?error=ExpiredToken");
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return redirectTo("/login?verified=true&completeProfile=true");
}
