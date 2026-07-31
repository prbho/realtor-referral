import { Trophy, Sparkles } from "lucide-react";

interface RankBannerProps {
  currentRankLabel: string;
  nextMilestone?: { label: string; target: number } | null;
  validRealtorCount: number;
  heroProgress: number;
  isMaxRank: boolean;
}

export default function RankBanner({
  currentRankLabel,
  nextMilestone,
  validRealtorCount,
  heroProgress,
  isMaxRank,
}: RankBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-sm">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Current Rank
            </p>
            <h2 className="text-lg font-bold flex items-center gap-1.5">
              {currentRankLabel}
              <Sparkles className="h-4 w-4 text-amber-400" />
            </h2>
          </div>
        </div>

        <div className="w-full sm:w-64">
          {!isMaxRank && nextMilestone ? (
            <>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Next: {nextMilestone.label}</span>
                <span>
                  {validRealtorCount}/{nextMilestone.target}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-sky-300 transition-all duration-700"
                  style={{ width: `${heroProgress}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-xs font-medium text-emerald-300 text-right">
              🏅 Max rank achieved
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
