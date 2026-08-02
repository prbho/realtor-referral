// components/Leaderboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Trophy, Loader2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

interface LeaderboardEntry {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  referralCount: number;
  allTimeReferralCount: number;
}

type Period = "week" | "month" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  week: "Week",
  month: "Month",
  all: "All Time",
};

const MEDALS = ["🥇", "🥈", "🥉"];

const getReferralBadge = (count: number) => {
  if (count >= 80) return "Legend";
  if (count >= 40) return "Elite Recruiter";
  if (count >= 20) return "Rising Star";
  if (count >= 10) return "Momentum";
  return "New Recruit";
};

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/leaderboard?period=${period}`);
        if (!res.ok) {
          throw new Error("Failed to load leaderboard");
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
  }, [period]);

  return (
    <div className="col-span-4 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-200">
      <div className="flex flex-col  justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-100 to-fuchsia-100/5">
            <Trophy className="h-6 w-6 text-fuchsia-800" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Leaderboard
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Top 20 referrers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-between">
          {(["week", "month", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full flex-1 px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                p === period
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-4 py-3 max-h-99 overflow-y-auto hover-scrollbar">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400 text-center py-5">
            {error}
          </p>
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-5">
            No referrals in this period.
          </p>
        ) : (
          <div className="space-y-1">
            {data.map((entry, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                    isTop3
                      ? "bg-amber-50/70 dark:bg-amber-950/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {isTop3 ? MEDALS[rank - 1] : `#${rank}`}
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar src={entry.image} name={entry.name} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.name || "Unnamed"}
                      </p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {getReferralBadge(entry.allTimeReferralCount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-900 dark:text-white">
                    {entry.referralCount}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
