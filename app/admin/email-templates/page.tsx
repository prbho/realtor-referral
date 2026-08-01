import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/currentUser";
import EmailTemplatesManager from "@/components/admin/EmailTemplatesManager";

export default async function EmailTemplatesPage() {
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

  return (
    <EmailTemplatesManager
      initialTemplates={JSON.parse(JSON.stringify(templates))}
    />
  );
}
