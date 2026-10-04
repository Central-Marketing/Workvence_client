"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { DashboardSkeleton } from "@/components/ui";
import { SellerDashboard } from "@/features/dashboard";
import kycService from "@/utils/kycService";

export default function SellerDashboardPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const { data: kycData, isLoading: isKycLoading } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: () => kycService.getKycStatus(),
    enabled: Boolean(user?.isSeller && !user?.isKycVerified),
    staleTime: 60000,
  });

  const isKycSubmittedOrVerified = Boolean(
    user?.isKycVerified ||
    kycData?.isKycVerified ||
    kycData?.kyc?.status === "pending" ||
    kycData?.kyc?.status === "approved"
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) return;

    if (!user.onboardingCompleted) {
      router.replace("/seller/onboarding");
      return;
    }

    if (!user.isKycVerified && !isKycLoading && !isKycSubmittedOrVerified) {
      router.replace("/kyc");
      return;
    }
  }, [user, isKycLoading, isKycSubmittedOrVerified, router]);

  if (
    !user ||
    !user.onboardingCompleted ||
    (!user.isKycVerified && (isKycLoading || !isKycSubmittedOrVerified))
  ) {
    return <DashboardSkeleton />;
  }

  return (
    <SellerDashboard
      user={user}
      onSwitchToBuyer={() => router.push("/dashboard/buyer")}
    />
  );
}
