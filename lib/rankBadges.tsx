import { ReactNode } from "react";

export interface RankBadge {
  label: string;
  threshold?: number;
  icon: ReactNode;
  alt: string;
}

export const RANK_BADGES: RankBadge[] = [
  {
    label: "Momentum",
    threshold: 10,
    icon: (
      <span role="img" aria-label="Momentum">
        ⚡
      </span>
    ),
    alt: "Momentum",
  },
  {
    label: "Rising Star",
    threshold: 20,
    icon: (
      <span role="img" aria-label="Rising Star">
        ✨
      </span>
    ),
    alt: "Rising Star",
  },
  {
    label: "Elite Recruiter",
    threshold: 40,
    icon: (
      <span role="img" aria-label="Elite Recruiter">
        🔥
      </span>
    ),
    alt: "Elite Recruiter",
  },
  {
    label: "Legend",
    threshold: 80,
    icon: (
      <span role="img" aria-label="Legend">
        🏆
      </span>
    ),
    alt: "Legend",
  },
];

export const RANK_PREVIEW_BADGES: RankBadge[] = [
  {
    label: "Momentum",
    icon: (
      <span role="img" aria-label="Momentum">
        ⚡
      </span>
    ),
    alt: "Momentum",
  },
  {
    label: "Rising Star",
    icon: (
      <span role="img" aria-label="Rising Star">
        ✨
      </span>
    ),
    alt: "Rising Star",
  },
  {
    label: "Elite Recruiter",
    icon: (
      <span role="img" aria-label="Elite Recruiter">
        🔥
      </span>
    ),
    alt: "Elite Recruiter",
  },
  {
    label: "Legend",
    icon: (
      <span role="img" aria-label="Legend">
        🏆
      </span>
    ),
    alt: "Legend",
  },
];

export function getRankBadges(referralCount: number) {
  return RANK_BADGES.filter((badge) => referralCount >= (badge.threshold ?? 0));
}

export function getSuperAdminPreviewBadges(isSuperAdmin: boolean) {
  return isSuperAdmin && process.env.NODE_ENV !== "production"
    ? RANK_PREVIEW_BADGES
    : [];
}
