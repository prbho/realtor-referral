import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getSystemSettings, getEmailsSentToday } from "@/lib/systemSettings";
import SystemSettingsForm from "@/components/SystemSettingsForm";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Only admins can access – super admins have role "ADMIN" as well
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settings = await getSystemSettings();
  const emailsSentToday = await getEmailsSentToday();

  return (
    <SystemSettingsForm
      initialSettings={{
        emailLimitEnabled: settings.emailLimitEnabled,
        emailDailyLimit: settings.emailDailyLimit,
        ninVerificationRequired: settings.ninVerificationRequired,
        registrationPaused: settings.registrationPaused,
        registrationPauseReason: settings.registrationPauseReason,
        registrationPauseUntil: settings.registrationPauseUntil
          ? settings.registrationPauseUntil.toISOString()
          : null,
      }}
      emailsSentToday={emailsSentToday}
    />
  );
}
