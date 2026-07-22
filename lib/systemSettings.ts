import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export type SystemSettings = {
  emailLimitEnabled: boolean;
  emailDailyLimit: number;
  ninVerificationRequired: boolean;
  registrationPaused: boolean;
  registrationPauseReason: string | null;
  registrationPauseUntil: Date | null;
  registrationPausedBy: string | null; // admin ID who paused
  registrationPausedAt: Date | null; // when it was paused
};

export async function getSystemSettings(): Promise<SystemSettings> {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  return {
    emailLimitEnabled: settings?.emailLimitEnabled ?? true,
    emailDailyLimit: settings?.emailDailyLimit ?? 100,
    ninVerificationRequired: settings?.ninVerificationRequired ?? true,
    registrationPaused: settings?.registrationPaused ?? false,
    registrationPauseReason: settings?.registrationPauseReason ?? null,
    registrationPauseUntil: settings?.registrationPauseUntil ?? null,
    registrationPausedBy: settings?.registrationPausedBy ?? null,
    registrationPausedAt: settings?.registrationPausedAt ?? null,
  };
}

export async function updateSystemSettings(data: {
  emailLimitEnabled?: boolean;
  emailDailyLimit?: number;
  ninVerificationRequired?: boolean;
  registrationPaused?: boolean;
  registrationPauseReason?: string | null;
  registrationPauseUntil?: Date | string | null;
  registrationPausedBy?: string | null;
  registrationPausedAt?: Date | null; // add this
}) {
  const current = await prisma.systemSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  const parsePauseUntil = (
    value: Date | string | null | undefined
  ): Date | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return value ? new Date(value) : null;
    return value;
  };

  const updatePayload = {
    emailLimitEnabled:
      data.emailLimitEnabled ?? current?.emailLimitEnabled ?? true,
    emailDailyLimit: data.emailDailyLimit ?? current?.emailDailyLimit ?? 100,
    ninVerificationRequired:
      data.ninVerificationRequired ?? current?.ninVerificationRequired ?? true,
    registrationPaused:
      data.registrationPaused ?? current?.registrationPaused ?? false,
    registrationPauseReason:
      data.registrationPauseReason !== undefined
        ? data.registrationPauseReason
        : current?.registrationPauseReason ?? null,
    registrationPauseUntil:
      data.registrationPauseUntil !== undefined
        ? parsePauseUntil(data.registrationPauseUntil)
        : current?.registrationPauseUntil ?? null,
    registrationPausedBy:
      data.registrationPausedBy !== undefined
        ? data.registrationPausedBy
        : current?.registrationPausedBy ?? null,
    registrationPausedAt:
      data.registrationPausedAt !== undefined
        ? data.registrationPausedAt
        : current?.registrationPausedAt ?? null,
  };

  return prisma.systemSettings.upsert({
    where: { id: SETTINGS_ID },
    update: updatePayload,
    create: {
      id: SETTINGS_ID,
      ...updatePayload,
    },
  });
}

// ─── email helpers (unchanged) ──────────────────────────────
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
  return prisma.emailLog.count({
    where: { sentAt: { gte: startOfToday() } },
  });
}

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
