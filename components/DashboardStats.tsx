"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Wallet, Link2Icon, Lock, ChevronRight } from "lucide-react";
import StatCard from "@/components/StatCard";
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
  ninVerificationRequired: boolean;
  validRealtorCount?: number;
  weeklyReferrals?: number;
}

function LockedCard({
  message,
  onVerifyClick,
}: {
  message: string;
  onVerifyClick: () => void;
}) {
  return (
    <div className="relative overflow-hidden bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-xl p-6 text-center">
      <Lock className="h-6 w-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
      <p className="text-amber-800 dark:text-amber-200 font-medium">
        {message}
      </p>
      <button
        onClick={onVerifyClick}
        className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-700 dark:text-amber-300 underline hover:no-underline"
      >
        Verify NIN to unlock <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function DashboardStats({
  user,
  // referralLink,
  ninVerificationRequired,
  weeklyReferrals = 0,
}: DashboardStatsProps) {
  const router = useRouter();
  const [showNinModal, setShowNinModal] = useState(false);
  const [ninVerified, setNinVerified] = useState(user.ninVerified || false);

  const isVerified = ninVerificationRequired ? ninVerified : true;

  const handleVerified = () => {
    setNinVerified(true);
    router.refresh();
  };

  const changeText =
    weeklyReferrals > 0 ? `+${weeklyReferrals} this week` : "0 this week";

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Referrals */}
        <div className="rounded-xl bg-linear-to-br from-blue-400 to-indigo-500 p-[1.5px]">
          <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full">
            <StatCard
              icon={
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              }
              label="Total Referrals"
              value={user.referralCount}
              change={changeText}
              bg="bg-blue-50 dark:bg-blue-950/20"
            />
          </div>
        </div>

        {/* Commission */}
        <div className="rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 p-[1.5px]">
          <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full">
            <StatCard
              icon={
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              }
              label="Commission Earned"
              value={`₦${user.commission.toFixed(2)}`}
              bg="bg-emerald-50 dark:bg-emerald-950/20"
            />
          </div>
        </div>

        {/* Referral Code */}
        {isVerified ? (
          <div className="rounded-xl bg-linear-to-br from-purple-400 to-fuchsia-500 p-[1.5px]">
            <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full">
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
            </div>
          </div>
        ) : (
          <LockedCard
            message="Complete NIN verification to unlock your referral code."
            onVerifyClick={() => setShowNinModal(true)}
          />
        )}
      </div>

      <NINVerificationModal
        isOpen={showNinModal}
        onClose={() => setShowNinModal(false)}
        onVerified={handleVerified}
        currentNin={user.nin}
      />
    </>
  );
}
