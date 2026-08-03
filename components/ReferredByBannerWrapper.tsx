"use client";

import ReferredByBanner from "./ReferredByBanner";

interface ReferredByBannerWrapperProps {
  userId: string;
  hasReferrer: boolean;
}

export default function ReferredByBannerWrapper({
  userId,
  hasReferrer,
}: ReferredByBannerWrapperProps) {
  // If user already has a referrer, don't show anything
  if (hasReferrer) return null;

  const handleSuccess = () => {
    // Parent can refresh or hide the banner (handled internally)
  };

  return <ReferredByBanner userId={userId} onSuccess={handleSuccess} />;
}
