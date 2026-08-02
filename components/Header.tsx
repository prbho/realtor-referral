import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const session = await getServerSession(authOptions);

  let initialUser = null;
  if (session?.user?.id) {
    initialUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        isSuperAdmin: true,
      },
    });
  }

  return <HeaderClient initialUser={initialUser} />;
}
