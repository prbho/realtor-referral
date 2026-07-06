// app/admin/settings/page.tsx
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
      }}
      emailsSentToday={emailsSentToday}
    />
  );
}
