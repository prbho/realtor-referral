import Link from "next/link";
import {
  Users,
  Building2,
  TrendingUp,
  Wallet,
  Mail,
  Settings,
  ArrowRight,
  Lock,
  User,
  Clock,
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalRealtors: number;
  totalReferrals: number;
  totalCommission: number;
  newThisWeek: number;
  emailLimitEnabled: boolean;
  emailDailyLimit: number;
  emailsSentToday: number;
}

interface RegistrationSettings {
  paused: boolean;
  reason: string | null;
  pauseUntil: Date | null;
  pausedBy: string | null; // admin name
}

interface AdminOverviewProps {
  stats: PlatformStats;
  registrationSettings?: RegistrationSettings;
}

export default function AdminOverview({
  stats,
  registrationSettings,
}: AdminOverviewProps) {
  const emailUsagePercent = Math.min(
    (stats.emailsSentToday / stats.emailDailyLimit) * 100,
    100
  );

  const isRegPaused = registrationSettings?.paused ?? false;
  const regReason = registrationSettings?.reason;
  const regPauseUntil = registrationSettings?.pauseUntil;
  const regPausedBy = registrationSettings?.pausedBy;

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-2xl shadow-lg p-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Platform Overview
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Realtime metrics for Regal PDC Realtor network
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors group"
        >
          View all users
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Users
            </span>
          </div>
          <p className="text-2xl font-bold mt-1.5">{stats.totalUsers}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            +{stats.newThisWeek} this week
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Realtors
            </span>
          </div>
          <p className="text-2xl font-bold mt-1.5">{stats.totalRealtors}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active partners</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Referrals
            </span>
          </div>
          <p className="text-2xl font-bold mt-1.5">{stats.totalReferrals}</p>
          <p className="text-xs text-slate-500 mt-0.5">Lifetime total</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Commissions
            </span>
          </div>
          <p className="text-2xl font-bold mt-1.5">
            ₦{stats.totalCommission.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Paid out</p>
        </div>
      </div>

      {/* Bottom Row: Email Limit + Registration Status + Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email Send Limit Card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-sky-400" />
              <span className="text-sm font-medium text-slate-200">
                Email Send Limit
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  stats.emailLimitEnabled
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {stats.emailLimitEnabled ? "ON" : "OFF"}
              </span>
            </div>
            <span className="text-sm text-slate-400">
              {stats.emailsSentToday} / {stats.emailDailyLimit}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${emailUsagePercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            {emailUsagePercent < 80
              ? "Plenty of capacity remaining"
              : emailUsagePercent < 100
              ? "Approaching daily limit"
              : "Daily limit reached"}
          </p>
        </div>

        {/* Registration Status Card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock
                className={`h-5 w-5 ${
                  isRegPaused ? "text-red-400" : "text-emerald-400"
                }`}
              />
              <span className="text-sm font-medium text-slate-200">
                Registration
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isRegPaused
                    ? "bg-red-500/20 text-red-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {isRegPaused ? "PAUSED" : "ACTIVE"}
              </span>
            </div>
          </div>
          {isRegPaused ? (
            <div className="mt-2 space-y-1">
              {regReason && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  Reason: {regReason}
                </p>
              )}
              {regPausedBy && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Paused by: {regPausedBy}
                </p>
              )}
              {regPauseUntil && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Resumes at: {new Date(regPauseUntil).toLocaleString()}
                </p>
              )}
              {!regPauseUntil && (
                <p className="text-xs text-slate-400">No resume time set</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">
              New users can register
            </p>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              System Settings
            </span>
          </div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors group"
          >
            Manage
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
