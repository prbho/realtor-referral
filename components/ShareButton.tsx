"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
}

export default function ShareButton({
  url,
  title = "Join Regal PDC",
  text = "Become a Realtor and earn commissions!",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Use Web Share API if available (mobile / desktop)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        console.warn("Share cancelled or failed:", err);
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy the link: " + url);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-600 transition-colors duration-200"
      aria-label="Share referral link"
    >
      <Share2 className="mr-2 h-4 w-4" />
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
