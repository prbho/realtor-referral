import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getSystemSettings, getEmailsSentToday } from "@/lib/systemSettings";
import Greeting from "@/components/Greeting";
import Link from "next/link";
import { AlertCircle, Zap } from "lucide-react";
import AdminOverview from "@/components/AdminOverview";
import DashboardStats from "@/components/DashboardStats";
import RecruitmentLadder from "@/components/RecruitmentLadder";
import { getRankBadges, getSuperAdminPreviewBadges } from "@/lib/rankBadges";
import RankAchievementModal from "@/components/RankAchievementModal";
import RankBanner from "@/components/RankBanner";
import ReferralsList from "@/components/ReferralsList";
import Leaderboard from "@/components/Leaderboard";
import ReferralLinkCard from "@/components/ReferralLinkCard";
import ReferredByBannerWrapper from "@/components/ReferredByBannerWrapper";

export const metadata = {
  title: "Dashboard | Regal PDC Realtor",
};

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
  { key: "whatsapp", label: "WhatsApp Number" },
] as const;

const hasProfileValue = (value: unknown) => {
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
};

const MILESTONES = [
  { id: "tm", label: "Team Manager", target: 200 },
  { id: "stb", label: "Senior Team Builder", target: 500 },
  { id: "ca", label: "Company Ambassador", target: 1500 },
];

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
      whatsapp: true,
      nin: true,
      ninVerified: true,
      referralCode: true,
      referralCount: true,
      commission: true,
      isSuperAdmin: true,
      referredBy: true,
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          image: true,
          role: true,
          ninVerified: true,
          // referredBy: true, // not needed on referral object
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";

  const missingFields = REQUIRED_PROFILE_FIELDS.filter(
    (field) => !hasProfileValue((user as Record<string, unknown>)[field.key])
  );
  const isProfileIncomplete = missingFields.length > 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const systemSettings = await getSystemSettings();
  const emailsSentToday = await getEmailsSentToday();

  const validRealtorReferrals = await prisma.user.count({
    where: {
      referredBy: user.id,
      role: "REALTOR",
    },
  });

  const achievedMilestones = MILESTONES.filter(
    (m) => validRealtorReferrals >= m.target
  );
  const nextMilestone = MILESTONES.find(
    (m) => validRealtorReferrals < m.target
  );

  const referrals = user.referrals;
  const currentRankLabel =
    achievedMilestones.length > 0
      ? achievedMilestones[achievedMilestones.length - 1].label
      : "Rookie Recruiter";
  const heroTarget =
    nextMilestone?.target ?? MILESTONES[MILESTONES.length - 1].target;
  const heroProgress = Math.min(
    100,
    Math.round((validRealtorReferrals / heroTarget) * 100)
  );
  const isMaxRank = !nextMilestone;

  const rankBadges = getRankBadges(validRealtorReferrals);
  const devSuperAdminBadges = getSuperAdminPreviewBadges(user.isSuperAdmin);
  const displayRankBadges =
    devSuperAdminBadges.length > 0 ? devSuperAdminBadges : rankBadges;

  let platformStats = null;
  let registrationSettings = null;

  if (isAdmin) {
    const [totalUsers, totalRealtors, totals, recentUsers] = await Promise.all([
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
    ]);

    platformStats = {
      totalUsers,
      totalRealtors,
      totalReferrals: totals._sum.referralCount || 0,
      totalCommission: totals._sum.commission || 0,
      newThisWeek: recentUsers,
      emailLimitEnabled: systemSettings.emailLimitEnabled,
      emailDailyLimit: systemSettings.emailDailyLimit,
      emailsSentToday,
    };

    let pausedByAdminName: string | null = null;
    if (
      systemSettings.registrationPaused &&
      systemSettings.registrationPausedBy
    ) {
      const admin = await prisma.user.findUnique({
        where: { id: systemSettings.registrationPausedBy },
        select: { name: true, email: true },
      });
      pausedByAdminName = admin?.name || admin?.email || null;
    }

    registrationSettings = {
      paused: systemSettings.registrationPaused,
      reason: systemSettings.registrationPauseReason,
      pauseUntil: systemSettings.registrationPauseUntil,
      pausedBy: pausedByAdminName,
    };
  }

  const referralLink = `${process.env.NEXTAUTH_URL}/register?ref=${user.referralCode}`;
  const ninVerificationRequired = systemSettings.ninVerificationRequired;
  const isVerified =
    user.isSuperAdmin || (ninVerificationRequired ? user.ninVerified : true);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ─── Compute weekly referrals ──────────────────────────────
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyReferrals = user.referrals.filter(
    (ref) => new Date(ref.createdAt) >= weekAgo
  ).length;

  return (
    <div className="space-y-8 relative">
      <RankAchievementModal currentRankLabel={currentRankLabel} />

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
        <div className="flex justify-end flex-row-reverse gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 items-end">
            <div className="text-xs font-medium px-2 py-1 rounded-xl w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-gray-300">
              {user.isSuperAdmin ? (
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  SuperAdmin
                </span>
              ) : (
                user.role
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {displayRankBadges.slice(0, -1).map((badge) => (
                <span
                  key={badge.label}
                  title={badge.label}
                  aria-label={badge.label}
                  className="inline-flex items-center justify-center text-sm font-semibold uppercase rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>

          <div className="group relative flex items-center flex-col gap-1">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-2xl">
                {displayRankBadges.length > 0
                  ? displayRankBadges[displayRankBadges.length - 1].icon
                  : "★"}
              </div>
              <span className="pointer-events-none absolute left-1/2 -bottom-10 -translate-x-1/2 rounded-full bg-slate-900/95 px-3 py-1 text-[11px] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap shadow-lg">
                {displayRankBadges.length > 0
                  ? displayRankBadges[displayRankBadges.length - 1].label
                  : "Rookie Recruiter"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ReferredByBannerWrapper
        userId={user.id}
        hasReferrer={!!user.referredBy}
      />

      {isProfileIncomplete && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3">
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

      {isAdmin && platformStats && (
        <AdminOverview
          stats={platformStats}
          registrationSettings={registrationSettings ?? undefined}
        />
      )}

      <RankBanner
        currentRankLabel={currentRankLabel}
        nextMilestone={nextMilestone}
        validRealtorCount={validRealtorReferrals}
        heroProgress={heroProgress}
        isMaxRank={isMaxRank}
      />

      <DashboardStats
        user={user}
        referralLink={referralLink}
        ninVerificationRequired={ninVerificationRequired}
        weeklyReferrals={weeklyReferrals}
      />

      {isVerified ? (
        <ReferralLinkCard
          referralLink={referralLink}
          showAnalyticsLink={true}
        />
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-xl p-6 text-center">
          <p className="text-amber-800 dark:text-amber-200 font-medium">
            🔒 Verify your NIN to access your referral link and code.
          </p>
          <Link
            href="/profile"
            className="inline-block mt-2 text-sm text-amber-700 dark:text-amber-300 underline hover:no-underline"
          >
            Go to Profile to verify →
          </Link>
        </div>
      )}

      <div className="md:grid lg:items-stretch gap-y-6 lg:grid-cols-14 lg:gap-x-4">
        <div className="lg:col-span-4">
          <RecruitmentLadder
            validRealtorCount={validRealtorReferrals}
            isVerified={isVerified}
          />
        </div>

        <ReferralsList
          referrals={referrals}
          isVerified={isVerified}
          referralLink={referralLink}
        />

        <Leaderboard />
      </div>
    </div>
  );
}
