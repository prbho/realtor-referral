"use client";

import { useState } from "react";
import { Trophy, Sparkles, X } from "lucide-react";
import ModalShell from "@/components/admin/ModalShell";

interface RankAchievementModalProps {
  currentRankLabel: string;
  onClose?: () => void;
}

export default function RankAchievementModal({
  currentRankLabel,
  onClose,
}: RankAchievementModalProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    if (!currentRankLabel || currentRankLabel === "Rookie Recruiter")
      return false;

    const storageKey = `rank-achievement-seen:${currentRankLabel}`;
    return !localStorage.getItem(storageKey);
  });

  const closeModal = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
      return;
    }

    if (currentRankLabel && currentRankLabel !== "Rookie Recruiter") {
      localStorage.setItem(`rank-achievement-seen:${currentRankLabel}`, "true");
    }
  };

  return (
    <ModalShell isVisible={isOpen} onClose={closeModal}>
      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Trophy className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-sm font-semibold">Congratulations!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You reached a new rank.
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            aria-label="Close congratulations modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
            <Sparkles className="h-8 w-8" />
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            {currentRankLabel}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            You have just crossed the threshold for this ranking. Your badge
            will appear on your dashboard now.
          </p>
          <button
            onClick={closeModal}
            className="mt-6 inline-flex items-center justify-center rounded-sm cursor-pointer bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Great!
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
