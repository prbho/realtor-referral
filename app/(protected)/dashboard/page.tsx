// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getSystemSettings, getEmailsSentToday } from "@/lib/systemSettings";
import CopyButton from "@/components/CopyButton";
import Greeting from "@/components/Greeting";
import Link from "next/link";
import {
  ChartNetwork,
  Link2Icon,
  UserRoundArrowLeft,
  Users,
  Building2,
  TrendingUp,
  UserPlus,
  Wallet,
  AlertCircle,
  Mail,
} from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Dashboard | Regal PDC Realtor",
};

function UserAvatar({
  src,
  name,
  size = 32,
}: {
  src: string | null;
  name: string | null;
  size?: number;
}) {
  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (src) {
    return (
      <Image
        src={src}
        alt={name || "Avatar"}
        width={size}
        height={size}
        className="inline-block rounded-full object-cover shrink-0"
        unoptimized
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}

const REQUIRED_PROFILE_FIELDS = [
  { key: "phone", label: "Phone Number" },
  { key: "streetAddress", label: "Street Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State/Province" },
  { key: "zipCode", label: "ZIP / Postal Code" },
  { key: "country", label: "Country" },
  { key: "accountName", label: "Account Name" },
  { key: "accountNumber", label: "Account Number" },
  { key: "bankName", label: "Bank Name" },
] as const;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      referrals: {
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.role === "ADMIN";

  const missingFields = REQUIRED_PROFILE_FIELDS.filter(
    (field) => !(user as unknown as Record<string, unknown>)[field.key]
  );
  const isProfileIncomplete = missingFields.length > 0;

  // Calculate date outside of the database query
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const platformStats = isAdmin
    ? await (async () => {
        const [
          totalUsers,
          totalRealtors,
          totals,
          recentUsers,
          systemSettings,
          emailsSentToday,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { role: "REALTOR" } }),
          prisma.user.aggregate({
            _sum: { referralCount: true, commission: true },
          }),
          prisma.user.count({
            where: {
              createdAt: {
                gte: sevenDaysAgo, // Use the pre-calculated date
              },
            },
          }),
          getSystemSettings(),
          getEmailsSentToday(),
        ]);

        return {
          totalUsers,
          totalRealtors,
          totalReferrals: totals._sum.referralCount || 0,
          totalCommission: totals._sum.commission || 0,
          newThisWeek: recentUsers,
          emailLimitEnabled: systemSettings.emailLimitEnabled,
          emailDailyLimit: systemSettings.emailDailyLimit,
          emailsSentToday,
        };
      })()
    : null;

  const referralLink = `${process.env.NEXTAUTH_URL}/register?ref=${user.referralCode}`;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 space-y-8 relative">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <Greeting name={user.name} />
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-neutral-600 dark:text-gray-300">
            {user.role}
          </span>
        </div>
        <p className="text-sm text-neutral-500 dark:text-gray-400 mt-1">
          {today}
        </p>
      </div>

      {/* Incomplete profile alert */}
      {isProfileIncomplete && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3 transition-colors duration-200">
          <div className="h-8 w-8 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Your profile is incomplete
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5">
              We&apos;re missing your{" "}
              {missingFields.map((f) => f.label).join(", ")}. Complete your
              profile so we can process your referral commission payouts.
            </p>
            <Link
              href="/profile"
              className="inline-block mt-2 text-sm font-medium text-amber-900 dark:text-amber-200 underline hover:no-underline"
            >
              Complete your profile →
            </Link>
          </div>
        </div>
      )}

      {/* Admin platform overview */}
      {isAdmin && platformStats && (
        <div className="bg-[#0b3264] dark:bg-slate-800 text-white p-6 rounded-xl shadow-md transition-colors duration-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Platform Overview</h2>
            <Link
              href="/admin"
              className="text-sm text-slate-300 hover:text-white underline"
            >
              View all users →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Total Users
                </p>
                <p className="text-xl font-bold">{platformStats.totalUsers}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Realtors
                </p>
                <p className="text-xl font-bold">
                  {platformStats.totalRealtors}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Total Referrals
                </p>
                <p className="text-xl font-bold">
                  {platformStats.totalReferrals}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  New This Week
                </p>
                <p className="text-xl font-bold">{platformStats.newThisWeek}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-700 dark:border-slate-600 flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                Total Commission Paid Out
              </p>
              <p className="text-xl font-bold">
                ₦{platformStats.totalCommission.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Email send limit status */}
          <Link
            href="/admin/settings"
            className="mt-4 flex items-center gap-3 hover:opacity-90 transition-opacity duration-200"
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Email Send Limit
                </p>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    platformStats.emailLimitEnabled
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {platformStats.emailLimitEnabled ? "ON" : "OFF"}
                </span>
              </div>
              <p className="text-sm font-medium">
                {platformStats.emailsSentToday} /{" "}
                {platformStats.emailDailyLimit} sent today
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Referral link + stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 dark:border-neutral-800 dark:bg-neutral-800 p-6 rounded-xl shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <Link2Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="font-semibold text-neutral-800 dark:text-white"
            >
              Your Referral Link
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 p-2 border rounded-md text-sm bg-gray-50 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white transition-colors duration-200"
            />
            <CopyButton text={referralLink} />
          </div>
        </div>

        <div className="bg-white border border-stone-200 dark:border-neutral-800 dark:bg-neutral-800 p-6 rounded-xl shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <ChartNetwork className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="font-semibold text-neutral-800 dark:text-white"
            >
              Your Stats
            </h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-500 dark:text-gray-400">
                Total Referrals
              </span>
              <span className="text-xl font-bold text-neutral-800 dark:text-white">
                {user.referralCount}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-500 dark:text-gray-400">
                Commission Earned
              </span>
              <span className="text-xl font-bold text-neutral-800 dark:text-white">
                ₦{user.commission.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals list */}
      <div className="bg-white border border-stone-200 dark:border-neutral-800 dark:bg-neutral-800 p-6 rounded-xl shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 shrink-0 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
            <UserRoundArrowLeft className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <h2
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="font-semibold text-neutral-800 dark:text-white"
          >
            Your Referrals
          </h2>
        </div>

        {user.referrals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              You haven&apos;t referred anyone yet.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Share your referral link above to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-neutral-700">
            {user.referrals.map(
              (ref: {
                id: string;
                name: string | null;
                email: string;
                createdAt: Date;
              }) => (
                <li key={ref.id} className="py-3 flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-semibold">
                    <UserAvatar src={user.image} name={user.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-800 dark:text-white truncate">
                      {ref.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {ref.email}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
