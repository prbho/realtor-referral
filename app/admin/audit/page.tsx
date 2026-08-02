import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/currentUser";
import AuditLogsTable from "@/components/admin/AuditLogsTable";

const PAGE_SIZE = 50;

interface AuditLogsPageProps {
  searchParams: { page?: string };
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdmin(currentUser)) {
    redirect("/dashboard");
  }

  const page = Math.max(Number(searchParams.page ?? "1"), 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <AuditLogsTable
      logs={JSON.parse(JSON.stringify(logs))}
      page={page}
      pageSize={PAGE_SIZE}
      total={total}
      totalPages={totalPages}
    />
  );
}
