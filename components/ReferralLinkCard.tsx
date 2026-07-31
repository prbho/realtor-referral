// components/ReferralLinkCard.tsx
"use client";

import Link from "next/link";
import { Link2Icon } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import ShareButton from "@/components/ShareButton";

interface ReferralLinkCardProps {
  referralLink: string;
  showAnalyticsLink?: boolean;
}

export default function ReferralLinkCard({
  referralLink,
  showAnalyticsLink = true,
}: ReferralLinkCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
            Your Referral Link
          </h2>
        </div>
        {showAnalyticsLink && (
          <Link
            href="/analytics"
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
          >
            View Analytics →
          </Link>
        )}
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
        Invite friends to join Regal PDC and let them discover a rewarding real
        estate career.
      </p>
    </div>
  );
}
