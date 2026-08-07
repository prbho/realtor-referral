import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/auditLog";
import { sendUnverifiedCleanupWarningEmail } from "@/lib/email";

const GRACE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const SYSTEM_SETTINGS_ID = "singleton";

const subDays = (date: Date, days: number) =>
  new Date(date.getTime() - days * DAY_MS);

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * DAY_MS);

function getClientIp(ipHeader: string | null): string | undefined {
  if (!ipHeader) return undefined;
  return ipHeader.split(",")[0]?.trim() || undefined;
}

async function getOrCreatePolicyStart(now: Date) {
  const settings = await prisma.systemSettings.upsert({
    where: { id: SYSTEM_SETTINGS_ID },
    update: {},
    create: {
      id: SYSTEM_SETTINGS_ID,
      emailLimitEnabled: true,
      emailDailyLimit: 100,
      commissionPerVerifiedReferral: 1000,
      ninVerificationRequired: true,
      registrationPaused: false,
      registrationPauseReason: null,
      registrationPauseUntil: null,
      unverifiedCleanupPolicyStartedAt: now,
    },
    select: {
      unverifiedCleanupPolicyStartedAt: true,
    },
  });

  if (settings.unverifiedCleanupPolicyStartedAt) {
    return settings.unverifiedCleanupPolicyStartedAt;
  }

  const updated = await prisma.systemSettings.update({
    where: { id: SYSTEM_SETTINGS_ID },
    data: { unverifiedCleanupPolicyStartedAt: now },
    select: { unverifiedCleanupPolicyStartedAt: true },
  });

  return updated.unverifiedCleanupPolicyStartedAt ?? now;
}

function isExistingUserWithinDeployGrace(
  userCreatedAt: Date,
  policyStartedAt: Date,
  now: Date
) {
  if (userCreatedAt >= policyStartedAt) {
    return false;
  }

  return now < addDays(policyStartedAt, GRACE_DAYS);
}

export type CleanupResult = {
  scanned: number;
  warned: number;
  deleted: number;
  skippedByDeployGrace: number;
  failures: number;
};

type CleanupDeletionResult =
  | { deletedNow: false; reason: "Already deleted" | "No longer eligible" }
  | {
      deletedNow: true;
      reason: "Deleted";
      deletedUser: {
        id: string;
        email: string;
        name: string | null;
        role: "USER" | "REALTOR" | "ADMIN";
        ninVerified: boolean;
        createdAt: Date;
        lastLoginAt: Date | null;
        referredBy: string | null;
        referrals: { id: string }[];
      };
    };

export async function runUnverifiedAccountCleanup(
  now: Date,
  ipHeader: string | null,
  userAgent: string | null
): Promise<CleanupResult> {
  const sevenDaysAgo = subDays(now, GRACE_DAYS);
  const policyStartedAt = await getOrCreatePolicyStart(now);

  const candidates = await prisma.user.findMany({
    where: {
      ninVerified: false,
      isSuperAdmin: false,
      role: { not: "ADMIN" },
      createdAt: { lte: sevenDaysAgo },
      OR: [{ lastLoginAt: null }, { lastLoginAt: { lte: sevenDaysAgo } }],
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
      referredBy: true,
      unverifiedCleanupWarningSentAt: true,
    },
    take: 200,
  });

  const ip = getClientIp(ipHeader);
  let warned = 0;
  let deleted = 0;
  let skippedByDeployGrace = 0;
  let failures = 0;

  for (const user of candidates) {
    try {
      if (
        isExistingUserWithinDeployGrace(user.createdAt, policyStartedAt, now)
      ) {
        skippedByDeployGrace += 1;

        if (!user.unverifiedCleanupWarningSentAt) {
          try {
            await sendUnverifiedCleanupWarningEmail(user.email);
            warned += 1;

            await prisma.user.update({
              where: { id: user.id },
              data: { unverifiedCleanupWarningSentAt: now },
            });

            await logAction(
              null,
              "UNVERIFIED_ACCOUNT_WARNING_SENT",
              {
                targetUserId: user.id,
                targetEmail: user.email,
                targetName: user.name,
                reason: "Within initial 7-day post-deploy grace period.",
                policyStartedAt,
                graceEndsAt: addDays(policyStartedAt, GRACE_DAYS),
              },
              ip,
              userAgent
            );
          } catch (emailError) {
            failures += 1;
            console.error("Failed to send cleanup warning email:", emailError);
          }
        }

        continue;
      }

      if (!user.unverifiedCleanupWarningSentAt) {
        try {
          await sendUnverifiedCleanupWarningEmail(user.email);
          warned += 1;

          await prisma.user.update({
            where: { id: user.id },
            data: { unverifiedCleanupWarningSentAt: now },
          });

          await logAction(
            null,
            "UNVERIFIED_ACCOUNT_WARNING_SENT",
            {
              targetUserId: user.id,
              targetEmail: user.email,
              targetName: user.name,
              reason:
                "Eligible for cleanup based on age, inactivity, and no NIN verification.",
              createdAt: user.createdAt,
              lastLoginAt: user.lastLoginAt,
            },
            ip,
            userAgent
          );
        } catch (emailError) {
          failures += 1;
          console.error("Failed to send cleanup warning email:", emailError);
        }

        continue;
      }

      // Recheck constraints in a transaction before deletion to avoid race conditions.
      const txResult = await prisma.$transaction<CleanupDeletionResult>(
        async (tx) => {
          const fresh = await tx.user.findUnique({
            where: { id: user.id },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isSuperAdmin: true,
              ninVerified: true,
              createdAt: true,
              lastLoginAt: true,
              referredBy: true,
              referrals: {
                where: { ninVerified: true },
                select: { id: true },
              },
            },
          });

          if (!fresh) {
            return { deletedNow: false, reason: "Already deleted" as const };
          }

          const stillInactive =
            !fresh.lastLoginAt || fresh.lastLoginAt <= sevenDaysAgo;
          const stillEligible =
            !fresh.ninVerified &&
            !fresh.isSuperAdmin &&
            fresh.role !== "ADMIN" &&
            fresh.createdAt <= sevenDaysAgo &&
            stillInactive;

          if (!stillEligible) {
            return { deletedNow: false, reason: "No longer eligible" as const };
          }

          await tx.user.delete({ where: { id: fresh.id } });

          return {
            deletedNow: true,
            reason: "Deleted" as const,
            deletedUser: fresh,
          };
        }
      );

      if (!txResult.deletedNow) {
        continue;
      }

      const deletedUser = txResult.deletedUser;

      deleted += 1;

      await logAction(
        null,
        "UNVERIFIED_ACCOUNT_AUTO_DELETED",
        {
          targetUserId: deletedUser.id,
          targetEmail: deletedUser.email,
          targetName: deletedUser.name,
          role: deletedUser.role,
          ninVerified: deletedUser.ninVerified,
          createdAt: deletedUser.createdAt,
          lastLoginAt: deletedUser.lastLoginAt,
          hadReferrer: Boolean(deletedUser.referredBy),
          verifiedReferralsCount: deletedUser.referrals.length,
          reason:
            "Account older than 7 days, no NIN verification, no successful sign-in in last 7 days, and warning was already sent.",
        },
        ip,
        userAgent
      );
    } catch (error) {
      failures += 1;
      console.error("Unverified cleanup failed for user", user.id, error);
    }
  }

  return {
    scanned: candidates.length,
    warned,
    deleted,
    skippedByDeployGrace,
    failures,
  };
}
