import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/currentUser";
import AdminCommissionTable from "@/components/admin/AdminCommissionTable";
import {
  calculateCommissionFromVerifiedCount,
  calculatePaidCommission,
  calculateRemainingCommission,
  normalizePaidReferralCount,
} from "@/lib/commission";
import { getSystemSettings } from "@/lib/systemSettings";

export default async function AdminCommissionPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdmin(currentUser)) {
    redirect("/dashboard");
  }

  const settings = await getSystemSettings();
  const commissionPerVerifiedReferral = settings.commissionPerVerifiedReferral;

  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      paidReferralCount: true,
      createdAt: true,
      referrals: {
        select: {
          id: true,
          ninVerified: true,
        },
      },
    },
  });

  const rankedUsers = users
    .map((user) => {
      const referralCount = user.referrals.length;
      const verifiedReferralCount = user.referrals.filter(
        (ref) => ref.ninVerified
      ).length;

      return {
        ...user,
        referralCount,
        verifiedReferralCount,
        paidReferralCount: normalizePaidReferralCount(
          user.paidReferralCount,
          verifiedReferralCount
        ),
        totalCommission: calculateCommissionFromVerifiedCount(
          verifiedReferralCount,
          commissionPerVerifiedReferral
        ),
        paidCommission: calculatePaidCommission(
          user.paidReferralCount,
          verifiedReferralCount,
          commissionPerVerifiedReferral
        ),
        remainingCommission: calculateRemainingCommission(
          verifiedReferralCount,
          user.paidReferralCount,
          commissionPerVerifiedReferral
        ),
      };
    })
    .sort(
      (left, right) =>
        right.totalCommission - left.totalCommission ||
        right.referralCount - left.referralCount ||
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

  return (
    <AdminCommissionTable users={JSON.parse(JSON.stringify(rankedUsers))} />
  );
}
