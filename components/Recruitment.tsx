import MilestoneCard from "@/components/MilestoneCard";
import { Users, TrendingUp, Crown } from "lucide-react";

export default function Recruitment() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-xl shadow-lg p-5 transition-colors duration-200">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Recruitment Milestones & Benefits
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Unlock exclusive rewards and milestone-based benefits
        </p>
      </div>
      <div className="mt-8 space-y-4">
        <MilestoneCard
          number="01"
          title="TEAM MANAGER (TM)"
          icon={<Users className="h-4 w-4 text-blue-700" />}
          reward={
            <>
              <span>₦500K</span>
              <p className="text-sm font-medium text-slate-200">
                Plus <span className="font-bold">1% Annual Cash Gift</span>
                <br />
                when your team makes
                <span className="font-bold text-lime-400">
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
          icon={<TrendingUp className="h-4 w-4 text-blue-700" />}
          reward={
            <>
              <span>₦800K</span>
              <p className="text-sm font-medium text-slate-200 mt-1">
                Plus 1% Annual Cash Gift
                <br />
                when your team makes
                <span className="font-bold text-lime-400">
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
          icon={<Crown className="h-4 w-4 text-blue-700" />}
          variant="gold" // <-- different background for third card
          reward={
            <>
              <span>₦300K</span>
              <span className="ml-1 text-sm font-medium text-slate-200">
                Monthly Salary
              </span>
              <ul className="text-sm font-medium text-slate-200 mt-1 space-y-0.5">
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
