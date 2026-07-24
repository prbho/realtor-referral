import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export type CurrentUser = {
  id: string;
  role: "USER" | "REALTOR" | "ADMIN";
  isSuperAdmin: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isSuperAdmin: true },
  });
}

export function isAdmin(user: CurrentUser): boolean {
  return user.role === "ADMIN" || user.isSuperAdmin;
}
