import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminUsersTable from "./AdminUsersTable";
import { getCurrentUser, isAdmin } from "@/lib/currentUser";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdmin(currentUser)) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      image: true,
      nin: true,
      email: true,
      role: true,
      referralCode: true,
      referralCount: true,
      commission: true,
      createdAt: true,
      phone: true,
      streetAddress: true,
      apartment: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      accountName: true,
      accountNumber: true,
      bankName: true,
      isSuperAdmin: true,
      // Include the referrer relation
      referrer: {
        select: {
          id: true,
          name: true,
        },
      },
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Transform data to match the expected shape (referredBy as object or null)
  const transformedUsers = users.map((user: (typeof users)[0]) => {
    const { referrer, ...rest } = user;
    return {
      ...rest,
      referredBy: referrer ? { id: referrer.id, name: referrer.name } : null,
    };
  });

  return (
    <AdminUsersTable
      users={JSON.parse(JSON.stringify(transformedUsers))}
      currentUserId={currentUser.id}
    />
  );
}
