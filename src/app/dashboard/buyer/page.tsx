"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import { BuyerDashboard } from "@/features/dashboard";

export default function BuyerDashboardPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#FAFAFA] text-center px-4 font-sans">
        <Loader size={45} />
        <h2 className="text-xl font-bold text-gray-800">Please log in to access your dashboard.</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Sign in to view your personalized recommendations, track active projects, and discover top services.
        </p>
      </div>
    );
  }

  return (
    <BuyerDashboard
      user={user}
      onSwitchToSeller={user?.isSeller ? () => router.push("/dashboard/seller") : undefined}
    />
  );
}
