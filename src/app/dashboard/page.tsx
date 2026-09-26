"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { DashboardSkeleton } from "@/components/ui";
import { BuyerDashboard, SellerDashboard } from "@/features/dashboard";

export default function DashboardPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const [roleView, setRoleView] = useState<"buyer" | "seller" | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      if (user.isSeller) {
        router.replace("/dashboard/seller");
      } else {
        router.replace("/dashboard/buyer");
      }
    }
  }, [user, router]);

  // Determine current view: override if user explicitly toggled, otherwise default by user.isSeller
  const currentView = roleView || (user?.isSeller ? "seller" : "buyer");

  if (!user) {
    return <DashboardSkeleton />;
  }

  if (currentView === "seller") {
    return (
      <SellerDashboard
        user={user}
        onSwitchToBuyer={() => {
          setRoleView("buyer");
          router.push("/dashboard/buyer");
        }}
      />
    );
  }

  return (
    <BuyerDashboard
      user={user}
      onSwitchToSeller={
        user?.isSeller
          ? () => {
            setRoleView("seller");
            router.push("/dashboard/seller");
          }
          : undefined
      }
    />
  );
}
