"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  url: string;
}

export default function ShareButton({ url }: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Regal PDC Realtor",
          text: "Hi! 👋 Your real estate journey starts here. Join the Regal PDC Realtor Network and gain access to opportunities, training, and a community dedicated to your success.",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error) {
      console.error("Unable to share referral link:", error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        shared
          ? "bg-emerald-600 text-white"
          : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
      }`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Share2
          className={`absolute h-4 w-4 transition-all duration-200 ${
            shared
              ? "opacity-0 scale-50 rotate-12"
              : "opacity-100 scale-100 rotate-0"
          }`}
        />
        <Check
          className={`absolute h-4 w-4 transition-all duration-200 ${
            shared
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-50 -rotate-12"
          }`}
        />
      </span>
      <span className="min-w-10 text-left">{shared ? "Shared!" : "Share"}</span>
    </button>
  );
}
