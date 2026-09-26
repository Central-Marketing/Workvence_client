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
  }, []);

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <SellerDashboard
      user={user}
      onSwitchToBuyer={() => router.push("/dashboard/buyer")}
    />
  );
}
