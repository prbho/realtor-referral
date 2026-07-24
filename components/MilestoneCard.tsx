import { ReactNode } from "react";

interface Props {
  number: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  reward?: ReactNode;
  variant?: "default" | "gold" | "premium";
}

export default function MilestoneCard({
  number,
  title,
  icon,
  children,
  reward,
  variant = "default",
}: Props) {
  const themeClasses = {
    default: {
      border: "border-slate-700/40",
      cardBg: "bg-white/5 hover:bg-white/10",
      iconBg: "bg-sky-500/10 text-sky-300",
      badgeBg: "bg-sky-500/10 text-sky-300 border-sky-400/20",
    },
    gold: {
      border: "border-amber-700/30",
      cardBg: "bg-white/5 hover:bg-white/10",
      iconBg: "bg-amber-400/10 text-amber-300",
      badgeBg: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    },
    premium: {
      border: "border-purple-700/30",
      cardBg: "bg-white/5 hover:bg-white/10",
      iconBg: "bg-purple-500/10 text-purple-300",
      badgeBg: "bg-purple-500/10 text-purple-300 border-purple-400/20",
    },
  };

  const theme = themeClasses[variant];

  return (
    <div
      className={`rounded-2xl border ${theme.border} ${theme.cardBg} p-5 shadow-lg backdrop-blur-sm transition-colors duration-200`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${theme.badgeBg} text-sm font-semibold shadow-sm`}
        >
          {number}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme.iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {title}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="flex items-center justify-center sm:w-16"></div>

        <div className="flex-1 min-w-0">
          <div className="mt-3 text-sm leading-6 text-slate-200">
            {children}
          </div>
          {reward && (
            <div className="mt-4 text-lg font-semibold text-white">
              {reward}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
