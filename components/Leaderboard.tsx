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
}

type Period = "week" | "month" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  week: "Week",
  month: "Month",
  all: "All Time",
};

const MEDALS = ["🥇", "🥈", "🥉"];

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
    <div className="col-span-3 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 py-6 transition-colors duration-200 overflow-hidden">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-3 px-6">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Leaderboard
          </h2>
        </div>
        <span className="text-xs px-6 text-slate-500 dark:text-slate-400">
          Top 20 referrers
        </span>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 px-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
        {(["week", "month", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              p === period
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400 text-center py-4">
          {error}
        </p>
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          No referrals in this period.
        </p>
      ) : (
        <div className="space-y-2 max-h-90 overflow-y-auto pr-2">
          {data.map((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            return (
              <div
                key={entry.id}
                className={`flex items-center py-1 gap-1 rounded-lg transition-colors ${
                  isTop3
                    ? "bg-transparent"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="w-8 text-center font-mono text-sm text-slate-500 dark:text-slate-400">
                  {isTop3 ? MEDALS[rank - 1] : `#${rank}`}
                </div>
                <UserAvatar src={entry.image} name={entry.name} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize text-slate-900 dark:text-white truncate">
                    {entry.name || "Unnamed"}
                  </p>
                  {/* <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {entry.email}
                  </p> */}
                  <div className="flexitems-center gap-1 text-xs font-semibold text-stone-400 dark:text-blue-400">
                    {entry.referralCount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
