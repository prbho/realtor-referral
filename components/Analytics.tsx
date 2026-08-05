// components/Analytics.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  MailCheck,
  UserCheck,
  Wallet,
  CreditCard,
  HandCoins,
  Calendar,
  Loader2,
} from "lucide-react";
import StatCard from "@/components/StatCard";

interface AnalyticsData {
  conversionRate: number;
  funnel: {
    registered: number;
    emailVerified: number;
    ninVerified: number;
    realtor: number;
  };
  grossCommission: number;
  paidCommission: number;
  remainingCommission: number;
  monthlyData: { month: string; count: number }[];
  totalReferrals: number;
  realtorCount: number;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) {
          throw new Error("Failed to load analytics");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400 text-center py-4">
        {error}
      </p>
    );
  }

  if (!data) return null;

  const maxMonthly = Math.max(1, ...data.monthlyData.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="rounded-xl bg-linear-to-br from-blue-400 to-indigo-500 p-[1.5px]">
          <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full">
            <StatCard
              icon={
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              }
              label="Total Referrals"
              value={String(data.totalReferrals)}
              bg="bg-blue-50 dark:bg-blue-950/20"
            />
          </div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 p-[1.5px]">
          <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full">
            <StatCard
              icon={
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              }
              label="Realtors"
              value={String(data.realtorCount)}
              bg="bg-emerald-50 dark:bg-emerald-950/20"
            />
          </div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-violet-400 to-fuchsia-500 p-[1.5px]">
          <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full">
            <StatCard
              icon={
                <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              }
              label="Conversion Rate"
              value={`${data.conversionRate}%`}
              bg="bg-violet-50 dark:bg-violet-950/20"
            />
          </div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-amber-400 to-orange-500 p-[1.5px]">
          <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full">
            <StatCard
              icon={
                <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              }
              label="Gross Earning"
              value={`₦${data.grossCommission.toLocaleString()}`}
              bg="bg-amber-50 dark:bg-amber-950/20"
            />
          </div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-cyan-400 to-sky-500 p-[1.5px]">
          <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full">
            <StatCard
              icon={
                <HandCoins className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              }
              label="Commission Left"
              value={`₦${data.remainingCommission.toLocaleString()}`}
              bg="bg-cyan-50 dark:bg-cyan-950/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <CreditCard className="h-4 w-4 text-sky-500" />
          <span>
            Commission Paid:{" "}
            <strong>₦{data.paidCommission.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <MailCheck className="h-5 w-5 text-violet-500" />
          Referral Funnel
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.funnel.registered}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registered
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.funnel.emailVerified}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Email Verified
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.funnel.ninVerified}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              NIN Verified
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {data.funnel.realtor}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Realtor
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Monthly Referrals
          </h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {data.monthlyData.map((item, idx) => {
            const height = (item.count / maxMonthly) * 100;
            return (
              <div
                key={`${item.month}-${idx}`} // ✅ ensures unique key
                className="flex flex-col items-center flex-1"
              >
                <div
                  className="w-full bg-blue-500 dark:bg-blue-400 rounded-t transition-all duration-500"
                  style={{
                    height: `${Math.max(4, height)}%`,
                    minHeight: height > 0 ? "8px" : "4px",
                  }}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                  {item.month}
                </p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {item.count}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
