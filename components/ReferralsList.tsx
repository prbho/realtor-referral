// components/ReferralsList.tsx
"use client";

import Link from "next/link";
import {
  Share2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Contact,
} from "lucide-react";
import ShareButton from "@/components/ShareButton";
import UserAvatar from "@/components/UserAvatar";

interface Referral {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  image: string | null;
  role: string;
  ninVerified: boolean;
}

interface ReferralsListProps {
  referrals: Referral[];
  isVerified: boolean;
  referralLink: string;
}

const roleBadgeColor = (role: string) =>
  role === "ADMIN"
    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
    : role === "REALTOR"
    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    : "bg-gray-100 dark:bg-neutral-700 text-neutral-600 dark:text-gray-300";

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

export default function ReferralsList({
  referrals,
  isVerified,
  referralLink,
}: ReferralsListProps) {
  return (
    <div className="col-span-6 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200 overflow-hidden">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-sky-100 to-sky-100/5">
            <Contact className="h-6 w-6 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Your Referral
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Team Members
            </p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400">
          {referrals.length} total
        </span>
      </div>
      <div className="flex items-center mb-6 gap-3 text-sm text-slate-500 dark:text-slate-400 shrink-0">
        <p className="text-sm text-slate-400 dark:text-slate-400">
          Grow your network, earn commissions, and unlock milestones.
        </p>
      </div>

      {/* ─── List ───────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {referrals.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-950/40 dark:border-slate-700 rounded-2xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
              <Share2 className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              You haven&apos;t referred anyone yet.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {isVerified
                ? "Share your referral link to get started."
                : "Verify your NIN to access your referral link."}
            </p>
            {isVerified ? (
              <div className="mt-6 flex justify-center">
                <ShareButton url={referralLink} />
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-neutral-700">
            {referrals.map((ref) => (
              <li key={ref.id} className="py-3 flex items-center gap-3 group">
                <UserAvatar src={ref.image} name={ref.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {ref.name || "Unnamed"}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeColor(
                        ref.role
                      )}`}
                    >
                      {ref.role}
                    </span>
                    {ref.ninVerified ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {ref.email}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0 text-xs text-slate-400 dark:text-slate-500">
                  <span>{getRelativeTime(new Date(ref.createdAt))}</span>
                  <Link
                    href={`/realtors/${ref.id}`}
                    className="mt-1 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
