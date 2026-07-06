// app/profile/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";
export const metadata = {
  title: "Profile | Regal PDC Realtor",
};
export default async function ProfilePage() {
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
      role: true,
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
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileForm user={user} />;
}
