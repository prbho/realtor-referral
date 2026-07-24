import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/currentUser";

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdmin(currentUser)) {
    redirect("/dashboard");
  }

  redirect("/admin");
}
