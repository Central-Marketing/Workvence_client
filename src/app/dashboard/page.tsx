"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
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
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#FAFAFA] text-center px-4 font-sans">
        <Loader size={45} />
        <h2 className="text-xl font-bold text-gray-800">Please log in to access your dashboard.</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Sign in to view your personalized recommendations, track active projects, or manage your freelancer business.
        </p>
      </div>
    );
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
