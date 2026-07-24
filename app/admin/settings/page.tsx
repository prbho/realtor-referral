import { redirect } from "next/navigation";
import { getSystemSettings, getEmailsSentToday } from "@/lib/systemSettings";
import SystemSettingsForm from "@/components/SystemSettingsForm";
import { getCurrentUser, isAdmin } from "@/lib/currentUser";

export default async function AdminSettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // Only admins can access – super admins have role "ADMIN" as well
  if (!isAdmin(currentUser)) {
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
