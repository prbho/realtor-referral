// lib/systemSettings.ts
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getSystemSettings() {
  return prisma.systemSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function updateSystemSettings(data: {
  emailLimitEnabled?: boolean;
  emailDailyLimit?: number;
}) {
  return prisma.systemSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getTimeUntilReset() {
  const now = new Date();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diffMs = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}

export async function getEmailsSentToday() {
  return prisma.emailLog.count({ where: { sentAt: { gte: startOfToday() } } });
}

/**
 * Throws a user-facing error if the daily email limit is enabled and reached.
 * Call this before attempting any Resend send in a route handler.
 */
export async function assertEmailCapacityAvailable() {
  const settings = await getSystemSettings();
  if (!settings.emailLimitEnabled) return;

  const sentToday = await getEmailsSentToday();
  if (sentToday >= settings.emailDailyLimit) {
    const { hours, minutes } = getTimeUntilReset();

    throw new Error(
      `Unable to send an email right now. Please try again in ${hours} hours and ${minutes} minutes.`
    );
  }
}

export async function recordEmailSent() {
  await prisma.emailLog.create({ data: {} });
}
