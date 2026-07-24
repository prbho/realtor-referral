import MilestoneCard from "@/components/MilestoneCard";
import { Users, TrendingUp, Crown } from "lucide-react";

export default function HomeMilestone() {
  return (
    <div className="text-white px-4 sm:px-6 lg:px-8 lg:py-20 transition-colors duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Career Growth
        </p>
        <h2
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-3xl md:text-4xl font-semibold tracking-tight"
        >
          Recruitment Milestones
          <span className="italic text-sky-300"> & Benefits</span>
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Unlock exclusive rewards and milestone-based benefits as you grow your
          team.
        </p>
      </div>

      {/* Milestone Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MilestoneCard
          number="01"
          title="TEAM MANAGER (TM)"
          icon={<Users className="h-4 w-4 text-sky-300" />}
          reward={
            <>
              <span>₦500K</span>
              <p className="text-sm font-medium text-slate-300 mt-1">
                Plus{" "}
                <span className="font-semibold text-white">
                  1% Annual Cash Gift
                </span>
                <br />
                when your team makes
                <span className="font-semibold text-sky-300">
                  {" "}
                  ₦1 Billion Sales
                </span>
              </p>
            </>
          }
        >
          Recruit{" "}
          <span className="font-semibold text-white">200 valid Realtors</span>
          <br />
          and earn
        </MilestoneCard>

        <MilestoneCard
          number="02"
          title="SENIOR TEAM BUILDER (STB)"
          icon={<TrendingUp className="h-4 w-4 text-sky-300" />}
          reward={
            <>
              <span>₦800K</span>
              <p className="text-sm font-medium text-slate-300 mt-1">
                Plus{" "}
                <span className="font-semibold text-white">
                  1% Annual Cash Gift
                </span>
                <br />
                when your team makes
                <span className="font-semibold text-sky-300">
                  {" "}
                  ₦2 Billion Sales
                </span>
              </p>
            </>
          }
        >
          Recruit{" "}
          <span className="font-semibold text-white">500 valid Realtors</span>
          <br />
          and earn
        </MilestoneCard>

        <MilestoneCard
          number="03"
          title="COMPANY AMBASSADOR (CA)"
          icon={<Crown className="h-4 w-4 text-amber-300" />}
          variant="gold"
          reward={
            <>
              <span>₦300K</span>
              <span className="ml-1 text-sm font-medium text-slate-300">
                Monthly Salary
              </span>
              <ul className="text-sm font-medium text-slate-300 mt-1 space-y-0.5">
                <li>+1% Cash Gift</li>
                <li>Branded Marketing Car</li>
                <li>All Expenses Paid Trip</li>
              </ul>
            </>
          }
        >
          Recruit a team of
          <span className="font-semibold text-white"> 1500 valid members</span>
        </MilestoneCard>
      </div>
    </div>
  );
}
