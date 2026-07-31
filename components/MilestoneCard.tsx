import { ReactNode } from "react";

interface Props {
  number: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  reward?: ReactNode;
  variant?: "default" | "gold" | "premium" | "homeCard" | "diamond";
  infoButton?: ReactNode;
}

export default function MilestoneCard({
  number,
  title,
  icon,
  children,
  reward,
  variant = "default",
  infoButton,
}: Props) {
  const themeClasses = {
    default: {
      border: "border-slate-200/70",
      cardBg: "bg-sky-100/5 hover:bg-white/10",
      iconBg: "bg-[#0b3264]/5 text-white",
      badgeBg: "bg-sky-emerald/10 text-emerald-300 border-emerald-400/20",
    },
    gold: {
      border: "border-amber-300/30",
      cardBg: "bg-white/5 hover:bg-white/10",
      iconBg: "bg-amber-400/10 text-amber-300",
      badgeBg: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    },
    premium: {
      border: "border-violet-300/30",
      cardBg: "bg-white/5 hover:bg-white/10",
      iconBg: "bg-violet-500/10 text-violet-300",
      badgeBg: "bg-violet-500/10 text-violet-300 border-violet-400/20",
    },
    homeCard: {
      border: "border-sky-300/10",
      cardBg: "bg-sky-100/5 hover:bg-white/10",
      iconBg: "bg-[#0b3264]/5 text-white",
      badgeBg: "bg-sky-emerald/10 text-emerald-300 border-emerald-400/20",
    },
    diamond: {
      border: "border-cyan-300/10",
      cardBg: "bg-cyan-100/5 hover:bg-white/10",
      iconBg: "bg-cyan-500/10 text-cyan-300",
      badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-400/20",
    },
  };

  // ✅ Fallback to default theme if variant is not recognised
  const theme = themeClasses[variant] ?? themeClasses.default;

  // Optional: warn in development when an unknown variant is used
  if (process.env.NODE_ENV === "development" && !themeClasses[variant]) {
    console.warn(
      `[MilestoneCard] Unknown variant "${variant}". Falling back to "default".`
    );
  }

  return (
    <div
      className={`rounded-2xl border ${theme.border} ${theme.cardBg} p-5 backdrop-blur-sm transition-colors duration-200`}
    >
      <div className="flex gap-4">
        <div
          className={`flex shrink-0 h-8 w-8 items-center justify-center rounded-2xl border ${theme.badgeBg} text-sm font-semibold shadow-sm`}
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
          {infoButton && (
            <div className="shrink-0 absolute top-1.5 right-1.5">
              {infoButton}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {children}
              </div>
              {reward && (
                <div className="text-sm font-bold text-slate-900 dark:text-white">
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
