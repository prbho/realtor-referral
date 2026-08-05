export const COMMISSION_PER_VERIFIED_REFERRAL = 1000;

export function calculateCommissionFromVerifiedCount(
  verifiedReferralCount: number,
  commissionPerVerifiedReferral: number = COMMISSION_PER_VERIFIED_REFERRAL
): number {
  return verifiedReferralCount * commissionPerVerifiedReferral;
}

export function normalizePaidReferralCount(
  paidReferralCount: number,
  verifiedReferralCount: number
): number {
  return Math.max(0, Math.min(paidReferralCount, verifiedReferralCount));
}

export function calculatePaidCommission(
  paidReferralCount: number,
  verifiedReferralCount: number,
  commissionPerVerifiedReferral: number = COMMISSION_PER_VERIFIED_REFERRAL
): number {
  return calculateCommissionFromVerifiedCount(
    normalizePaidReferralCount(paidReferralCount, verifiedReferralCount),
    commissionPerVerifiedReferral
  );
}

export function calculateRemainingCommission(
  verifiedReferralCount: number,
  paidReferralCount: number,
  commissionPerVerifiedReferral: number = COMMISSION_PER_VERIFIED_REFERRAL
): number {
  return Math.max(
    0,
    calculateCommissionFromVerifiedCount(
      verifiedReferralCount,
      commissionPerVerifiedReferral
    ) -
      calculatePaidCommission(
        paidReferralCount,
        verifiedReferralCount,
        commissionPerVerifiedReferral
      )
  );
}

export function countVerifiedReferrals<T extends { ninVerified: boolean }>(
  referrals: T[]
): number {
  return referrals.filter((referral) => referral.ninVerified).length;
}
