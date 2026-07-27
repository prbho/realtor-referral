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
      border: "border-slate-200/5",
      cardBg: "bg-sky-100/5 hover:bg-white/10",
      iconBg: "bg-[#0b3264]/5 text-white",
      badgeBg: "bg-sky-emerald/10 text-emerald-300 border-emerald-400/20",
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
      className={`rounded-2xl border ${theme.border} ${theme.cardBg} p-5 backdrop-blur-sm transition-colors duration-200`}
    >
      <div className="flex gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${theme.badgeBg} text-sm font-semibold shadow-sm`}
        >
          {number}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-lg ${theme.iconBg}`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
                {title}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {children}
              </div>
              {reward && (
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {reward}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
