// components/admin/AdminStats.tsx
import { Users, TrendingUp, Wallet } from "lucide-react";
import StatCard from "@/components/StatCard";

interface AdminStatsProps {
  totalUsers: number;
  totalReferrals: number;
  totalCommission: number;
}

export default function AdminStats({
  totalUsers,
  totalReferrals,
  totalCommission,
}: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <StatCard
        icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        label="Total Users"
        value={String(totalUsers)}
        bg="bg-blue-50 dark:bg-blue-950/20"
      />
      <StatCard
        icon={
          <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        }
        label="Total Referrals"
        value={String(totalReferrals)}
        bg="bg-violet-50 dark:bg-violet-950/20"
      />
      <StatCard
        icon={
          <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        }
        label="Total Commission"
        value={`₦${totalCommission.toFixed(2)}`}
        bg="bg-emerald-50 dark:bg-emerald-950/20"
      />
    </div>
  );
}
