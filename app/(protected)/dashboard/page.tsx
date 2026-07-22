import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getSystemSettings, getEmailsSentToday } from "@/lib/systemSettings";
import Greeting from "@/components/Greeting";
import Link from "next/link";
import { UserRoundArrowLeft, AlertCircle, Zap } from "lucide-react";
import Image from "next/image";
import AdminOverview from "@/components/AdminOverview";
import DashboardStats from "@/components/DashboardStats";

export const metadata = {
  title: "Dashboard | Regal PDC Realtor",
};

// ─── UserAvatar ──────────────────────────────────────────────
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

// ─── Required fields ──────────────────────────────────────────
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
  { key: "nin", label: "NIN" },
] as const;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
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
      nin: true,
      ninVerified: true,
      referralCode: true,
      referralCount: true,
      commission: true,
      isSuperAdmin: true,
      referrals: {
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";

  const missingFields = REQUIRED_PROFILE_FIELDS.filter(
    (field) => !(user as unknown as Record<string, unknown>)[field.key]
  );
  const isProfileIncomplete = missingFields.length > 0;

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
                gte: sevenDaysAgo,
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

  // ─── Fetch NIN verification setting ──────────────────────────
  const systemSettings = await getSystemSettings();
  const ninVerificationRequired = systemSettings.ninVerificationRequired;

  const referralLink = `${process.env.NEXTAUTH_URL}/register?ref=${user.referralCode}`;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 md:p-8 space-y-8 relative">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-blue-50/30 to-white dark:from-slate-900/50 dark:to-slate-900" />

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Greeting name={user.name} />
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Welcome back. Here&apos;s what&apos;s happening with your account
            today.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {today}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-gray-300">
            {user.isSuperAdmin ? (
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                SuperAdmin
              </span>
            ) : (
              user.role
            )}
          </span>
          <UserAvatar src={user.image} name={user.name} size={40} />
        </div>
      </div>

      {/* ─── Incomplete profile alert ──────────────────────────── */}
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

      {/* ─── Platform Overview ────────────────────────────────── */}
      {isAdmin && platformStats && <AdminOverview stats={platformStats} />}

      {/* ─── Stats & Referral Link ───────────────────────────── */}
      <DashboardStats
        user={user}
        referralLink={referralLink}
        ninVerificationRequired={ninVerificationRequired}
      />

      {/* ─── Referrals List ────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-4">
          <UserRoundArrowLeft className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
            Your Referrals
          </h2>
        </div>

        {user.referrals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              You haven&apos;t referred anyone yet.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Share your referral link above to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-neutral-700">
            {user.referrals.map((ref) => (
              <li key={ref.id} className="py-3 flex items-center gap-3">
                <UserAvatar src={user.image} name={ref.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {ref.name || "Unnamed"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {ref.email}
                  </p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                  {new Date(ref.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
