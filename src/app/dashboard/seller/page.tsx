"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { DashboardSkeleton } from "@/components/ui";
import { SellerDashboard } from "@/features/dashboard";

export default function SellerDashboardPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      const hasCategories = Array.isArray(user.categories) && user.categories.length > 0;
      if (!user.onboardingCompleted && !hasCategories) {
        router.replace("/seller/onboarding");
      }
    }
  }, [user, router]);

  const hasCategories = Array.isArray(user?.categories) && user.categories.length > 0;
  if (!user || (!user.onboardingCompleted && !hasCategories)) {
    return <DashboardSkeleton />;
  }

  return (
    <SellerDashboard
      user={user}
      onSwitchToBuyer={() => router.push("/dashboard/buyer")}
    />
  );
}
