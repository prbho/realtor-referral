// app/settings/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";

export const metadata = {
  title: "Settings | Regal PDC Realtor",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailNotifications: true,
      marketingEmails: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <SettingsForm user={user} />;
}
