import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/currentUser";
import ScheduleEmailForm from "@/components/admin/ScheduleEmailForm";

export default async function ScheduleEmailPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdmin(currentUser)) {
    redirect("/dashboard");
  }

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { name: "asc" },
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
    },
  });

  const roleRecipients = {
    USER: [] as string[],
    REALTOR: [] as string[],
    ADMIN: [] as string[],
  };

  users.forEach((user) => {
    roleRecipients[user.role].push(user.id);
  });

  return (
    <ScheduleEmailForm
      templates={JSON.parse(JSON.stringify(templates))}
      roleRecipients={JSON.parse(JSON.stringify(roleRecipients))}
    />
  );
}
