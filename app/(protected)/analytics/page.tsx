// app/(protected)/analytics/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Analytics from "@/components/Analytics";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Analytics | Regal PDC Realtor",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        📊 Analytics
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Detailed insights into your referral performance.
      </p>
      <Analytics />
    </div>
  );
}
