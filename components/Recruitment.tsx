import MilestoneCard from "@/components/MilestoneCard";
import { Users, TrendingUp, Crown } from "lucide-react";

export default function Recruitment() {
  return (
    <div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Recruitment Milestones & Benefits
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Unlock exclusive rewards and milestone-based benefits
        </p>
        <p className="mt-3 text-xs font-medium text-emerald-600">
          Share your referral link and start earning higher rewards as your team
          grows.
        </p>
      </div>
      <div className="mt-8 space-y-4">
        <MilestoneCard
          number="01"
          title="TEAM MANAGER (TM)"
          icon={<Users className="h-3 w-3 text-[#0b3264]" />}
          reward={
            <>
              <span>₦500K</span>
              <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Plus <span className="font-bold">1% Annual Cash Gift</span>
                <br />
                when your team makes
                <span className="font-bold text-emerald-600">
                  {" "}
                  ₦1 Billion Sales
                </span>
              </p>
            </>
          }
        >
          Recruit <span className="font-bold">200 valid Realtors</span>
          <br />
          and earn
        </MilestoneCard>

        <MilestoneCard
          number="02"
          title="SENIOR TEAM BUILDER (STB)"
          icon={<TrendingUp className="h-3 w-3 text-[#0b3264]" />}
          reward={
            <>
              <span>₦800K</span>
              <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
                Plus 1% Annual Cash Gift
                <br />
                when your team makes
                <span className="font-bold text-emerald-600">
                  {" "}
                  ₦2 Billion Sales
                </span>
              </p>
            </>
          }
        >
          Recruit <span className="font-bold">500 valid Realtors</span>
          <br />
          and earn
        </MilestoneCard>

        <MilestoneCard
          number="03"
          title="COMPANY AMBASSADOR (CA)"
          icon={<Crown className="h-3 w-3 text-[#0b3264]" />}
          variant="gold" // <-- different background for third card
          reward={
            <>
              <span>₦300K</span>
              <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
                Monthly Salary
              </span>
              <ul className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                <li>+1% Cash Gift</li>
                <li>Branded Marketing Car</li>
                <li>All Expenses Paid Trip</li>
              </ul>
            </>
          }
        >
          Recruit a team of
          <span className="font-bold"> 1500 valid members</span>
        </MilestoneCard>
      </div>
    </div>
  );
}
