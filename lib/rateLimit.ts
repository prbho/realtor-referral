// lib/rateLimit.ts
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000; // 15 minute window
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; retryAfterMinutes?: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const attempts = await prisma.loginAttempt.count({
    where: { identifier, createdAt: { gte: windowStart } },
  });

  if (attempts >= MAX_ATTEMPTS) {
    const oldest = await prisma.loginAttempt.findFirst({
      where: { identifier, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
    });
    const retryAfterMs = oldest
      ? oldest.createdAt.getTime() + WINDOW_MS - Date.now()
      : WINDOW_MS;
    return {
      allowed: false,
      retryAfterMinutes: Math.max(1, Math.ceil(retryAfterMs / 60000)),
    };
  }

  return { allowed: true };
}

export async function recordAttempt(identifier: string) {
  await prisma.loginAttempt.create({ data: { identifier } });
}

export async function clearAttempts(identifier: string) {
  await prisma.loginAttempt.deleteMany({ where: { identifier } });
}
