"use client";

import { useState } from "react";
import { Crown, Sparkles, Lock, Info, X } from "lucide-react";
import MilestoneCard from "@/components/MilestoneCard";
import ModalShell from "@/components/admin/ModalShell";

interface RecruitmentLadderProps {
  validRealtorCount: number;
  isVerified?: boolean;
}

const MILESTONES = [
  {
    id: "tm",
    label: "Team Manager",
    target: 200,
    icon: <div>🏆</div>,
    variant: "gold" as const,
    number: "TM",
  },
  {
    id: "stb",
    label: "Senior Team Builder",
    target: 500,
    icon: <div>👑</div>,
    variant: "premium" as const,
    number: "STB",
  },
  {
    id: "ca",
    label: "Company Ambassador",
    target: 1500,
    icon: <div>💎</div>,
    variant: "diamond" as const,
    number: "CA",
  },
];

const TIER_STYLES = {
  gold: {
    ring: "#f59e0b",
    gradient: "from-amber-400 to-yellow-600",
    text: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-500/30",
  },
  premium: {
    ring: "#a855f7",
    gradient: "from-violet-500 to-fuchsia-600",
    text: "text-violet-600 dark:text-violet-400",
    glow: "shadow-violet-500/30",
  },
  diamond: {
    ring: "#38bdf8",
    gradient: "from-sky-400 to-cyan-300",
    text: "text-sky-600 dark:text-sky-400",
    glow: "shadow-sky-500/30",
  },
} as const;

const BENEFITS: Record<string, string[]> = {
  tm: [
    "Earn ₦500K Plus 1% Annual Cash Gift when your team makes ₦1 Billion Sales",
  ],
  stb: [
    "Earn ₦800K Plus 1% Annual Cash Gift when your team makes ₦2 Billion Sales",
  ],
  ca: [
    "₦300K Monthly Salary",
    "+1% Cash Gift",
    "Branded Marketing Car",
    "All Expenses Paid Trip",
  ],
};

export default function RecruitmentLadder({
  validRealtorCount,
  isVerified = true,
}: RecruitmentLadderProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextMilestone = MILESTONES.find((m) => validRealtorCount < m.target);

  const openModal = (id: string) => {
    setSelectedMilestone(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMilestone(null);
  };

  const selectedData = MILESTONES.find((m) => m.id === selectedMilestone);
  const benefits = selectedData ? BENEFITS[selectedData.id] : [];

  if (!isVerified) {
    return (
      <div className="relative overflow-hidden bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-xl p-6 text-center">
        <Lock className="h-6 w-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
        <p className="text-amber-800 dark:text-amber-200 font-medium">
          Verify your NIN to view your recruitment milestones.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl p-6 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
            Rank Ladder
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          You have recruited{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {validRealtorCount}
          </span>{" "}
          valid Realtors.
        </p>

        <div className="relative pl-2">
          <div className="absolute left-6 h-[70%] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-6">
            {MILESTONES.map((milestone) => {
              const progress = Math.min(
                100,
                Math.round((validRealtorCount / milestone.target) * 100)
              );
              const achieved = validRealtorCount >= milestone.target;
              const isCurrentFocus =
                !achieved && nextMilestone?.id === milestone.id;
              const style = TIER_STYLES[milestone.variant];

              return (
                <div key={milestone.id} className="relative flex gap-4">
                  <div
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isCurrentFocus
                        ? `ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ${style.glow}`
                        : ""
                    }`}
                    style={{
                      backgroundImage: achieved
                        ? `conic-gradient(${style.ring} 360deg, ${style.ring} 0deg)`
                        : `conic-gradient(${style.ring} ${
                            progress * 3.6
                          }deg, #e2e8f0 0deg)`,
                      backgroundColor: "transparent",
                    }}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800">
                      <span
                        className={achieved ? style.text : "text-slate-400"}
                      >
                        {milestone.icon}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 pt-1">
                    <MilestoneCard
                      number={milestone.number}
                      title={milestone.label}
                      icon={milestone.icon}
                      variant={milestone.variant}
                      reward={achieved ? "✅ Achieved!" : `${progress}%`}
                      infoButton={
                        <button
                          onClick={() => openModal(milestone.id)}
                          className="text-slate-400 cursor-pointer hover:text-blue-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                          aria-label={`Learn more about ${milestone.label}`}
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      }
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300">
                            {validRealtorCount} / {milestone.target}
                          </span>
                          {achieved ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Completed
                            </span>
                          ) : isCurrentFocus ? (
                            <span
                              className={`font-semibold flex items-center gap-1 ${style.text}`}
                            >
                              <Sparkles className="h-3 w-3" /> Up next
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              {progress}%
                            </span>
                          )}
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 bg-linear-to-r ${
                              achieved
                                ? "from-emerald-400 to-emerald-600"
                                : style.gradient
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </MilestoneCard>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Info Modal ──────────────────────────────────────── */}
      {isModalOpen && selectedData && (
        <ModalShell isVisible={isModalOpen} onClose={closeModal}>
          <div className="flex items-baseline justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{selectedData.icon}</span>
                {selectedData.label} Benefits
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Recruit {selectedData.target} Realtors to unlock this rank
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-4 space-y-3">
            {benefits.length > 0 ? (
              <ul className="space-y-2">
                {benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-emerald-500 dark:text-emerald-400">
                      ✦
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No benefits defined yet.
              </p>
            )}
          </div>
        </ModalShell>
      )}
    </>
  );
}
