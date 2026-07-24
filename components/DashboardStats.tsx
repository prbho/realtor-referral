"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Wallet, Link2Icon, Lock } from "lucide-react";
import StatCard from "@/components/StatCard";
import CopyButton from "@/components/CopyButton";
import ShareButton from "@/components/ShareButton";
import NINVerificationModal from "@/components/NINVerificationModal";

interface DashboardStatsProps {
  user: {
    referralCount: number;
    commission: number;
    referralCode: string | null;
    ninVerified: boolean;
    nin: string | null;
  };
  referralLink: string;
  ninVerificationRequired: boolean; // ✅ required prop
}

export default function DashboardStats({
  user,
  referralLink,
  ninVerificationRequired,
}: DashboardStatsProps) {
  const router = useRouter();
  const [showNinModal, setShowNinModal] = useState(false);
  const [ninVerified, setNinVerified] = useState(user.ninVerified || false);

  // If verification is not required, treat as always verified
  const isVerified = ninVerificationRequired ? ninVerified : true;

  const handleVerified = () => {
    setNinVerified(true);
    router.refresh();
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          label="Total Referrals"
          value={user.referralCount}
          change="+0 this week"
          bg="bg-blue-50 dark:bg-blue-950/20"
        />
        <StatCard
          icon={
            <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          }
          label="Commission Earned"
          value={`₦${user.commission.toFixed(2)}`}
          bg="bg-emerald-50 dark:bg-emerald-950/20"
        />
        {isVerified ? (
          <StatCard
            icon={
              <Link2Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            }
            label="Referral Code"
            value={user.referralCode ?? ""}
            copyable
            copyValue={user.referralCode ?? ""}
            bg="bg-purple-50 dark:bg-purple-950/20"
          />
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <div className="flex mb-2 items-center gap-2 text-amber-800 dark:text-amber-200 font-medium">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-medium">
                Complete NIN verification.
              </span>
            </div>
            <span className="text-sm">
              Verify your NIN to unlock your referral code and start earning
              referral rewards.
            </span>
            <button
              onClick={() => setShowNinModal(true)}
              className="inline-block mt-2 text-sm text-amber-700 dark:text-amber-300 underline hover:no-underline"
            >
              Verify NIN now →
            </button>
          </div>
        )}
      </div>

      {/* Referral Link Card */}
      {isVerified ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Link2Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
              Your Referral Link
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-col sm:flex-row">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 w-full p-2.5 border rounded-md text-sm bg-gray-50 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
            />
            <div className="flex flex-wrap gap-2">
              <CopyButton text={referralLink} />
              <ShareButton url={referralLink} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Invite friends to join Regal PDC and let them discover a rewarding
            real estate career.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <p className="text-amber-800 dark:text-amber-200 font-medium">
            🔒 Verify your NIN to access your referral link and code.
          </p>
          <button
            onClick={() => setShowNinModal(true)}
            className="inline-block mt-2 text-sm text-amber-700 dark:text-amber-300 underline hover:no-underline"
          >
            Verify NIN now →
          </button>
        </div>
      )}

      <NINVerificationModal
        isOpen={showNinModal}
        onClose={() => setShowNinModal(false)}
        onVerified={handleVerified}
        currentNin={user.nin}
      />
    </>
  );
}
