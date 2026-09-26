"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { DashboardSkeleton } from "@/components/ui";
import { BuyerDashboard } from "@/features/dashboard";

export default function BuyerDashboardPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <BuyerDashboard
      user={user}
      onSwitchToSeller={user?.isSeller ? () => router.push("/dashboard/seller") : undefined}
    />
  );
}
