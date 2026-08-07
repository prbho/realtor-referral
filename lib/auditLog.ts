// lib/auditLog.ts
import { prisma } from "./prisma";

import type { Prisma } from "@prisma/client";

export async function logAction(
  userId: string | null,
  action: string,
  details: Prisma.InputJsonValue = {},
  ip?: string | null,
  userAgent?: string | null
) {
  try {
    await prisma.auditLog.create({
      data: {
        ...(userId ? { userId } : {}),
        action,
        details,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
