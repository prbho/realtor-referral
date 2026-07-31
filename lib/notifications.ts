// lib/notifications.ts
import { prisma } from "@/lib/prisma";

type NotificationType = "referral" | "realtor" | "milestone" | "commission";

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link: link || null,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
