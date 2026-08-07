ALTER TABLE "User"
ADD COLUMN "lastLoginAt" TIMESTAMP(3),
ADD COLUMN "unverifiedCleanupWarningSentAt" TIMESTAMP(3);

ALTER TABLE "SystemSettings"
ADD COLUMN "unverifiedCleanupPolicyStartedAt" TIMESTAMP(3);

ALTER TABLE "AuditLog"
ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
