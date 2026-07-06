// app/login/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata = {
  title: "Sign In | Regal PDC Realtor",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
