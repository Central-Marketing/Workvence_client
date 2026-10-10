"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, ShieldCheck, ArrowRight, X, Lock, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { Button, Modal } from "@/components/ui";
import kycService from "@/utils/kycService";

export const KycPromptModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  // Mandatory KYC: skipping is forbidden for sellers
  const isKycPromptEnabled = process.env.NEXT_PUBLIC_ENABLE_KYC_PROMPT !== "false";
  const allowSkipKyc = false;

  // Query KYC status if user is a seller and not already verified
  const { data: statusData } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: () => kycService.getKycStatus(),
    enabled: Boolean(user?.isSeller && !user?.isKycVerified),
    staleTime: 60000,
  });

  useEffect(() => {
    if (!isKycPromptEnabled) return;

    // Retrieve active user from store or local storage fallback
    let currentUser = user;
    if (!currentUser && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) currentUser = JSON.parse(stored);
      } catch (e) {
        currentUser = null;
      }
    }

    if (!currentUser) {
      setIsOpen(false);
      return;
    }

    // Check if user is a seller and whether KYC is completed (submitted or approved)
    const isSeller = Boolean(currentUser.isSeller);
    const isKycSubmittedOrVerified = Boolean(
      currentUser.isKycVerified ||
      statusData?.isKycVerified ||
      statusData?.kyc?.status === "pending" ||
      statusData?.kyc?.status === "approved"
    );

    // Don't show modal if already on kyc, onboarding, auth, or admin pages
    const isExcludedPage =
      pathname === "/kyc" ||
      pathname === "/settings/verification" ||
      pathname.startsWith("/seller/onboarding") ||
      pathname === "/onboarding" ||
      pathname.startsWith("/admin") ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password";

    if (isSeller && !isKycSubmittedOrVerified && !isExcludedPage) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [user, pathname, isKycPromptEnabled, statusData]);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleGoToKyc = () => {
    setIsOpen(false);
    router.push("/kyc");
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (allowSkipKyc) handleDismiss();
      }}
      title="Verify Your Seller Identity"
      maxWidth="max-w-[500px]"
      showCloseButton={allowSkipKyc}
      footer={
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {allowSkipKyc && (
            <Button
              type="button"
              variant="outline"
              size="md"
              radius="fiverr"
              onClick={handleDismiss}
              className="w-full sm:flex-1 text-slate-700 font-semibold text-sm cursor-pointer"
            >
              Skip for Now
            </Button>
          )}

          <Button
            type="button"
            variant="brand"
            size="md"
            radius="fiverr"
            onClick={handleGoToKyc}
            className="w-full sm:flex-1 font-bold text-sm shadow-md hover:shadow-lg cursor-pointer"
            rightIcon={<ArrowRight size={16} />}
          >
            Verify Identity Now
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-[6px] bg-gradient-to-tr from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center mb-5 text-brand-green shadow-xs">
          <ShieldAlert size={32} strokeWidth={2.2} />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          To maintain a safe marketplace and unlock instant earnings payouts, please complete a fast one-time identity verification.
        </p>

        {/* Benefits List */}
        <div className="w-full bg-slate-50 border border-slate-100 rounded-[6px] p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
            <CheckCircle2 size={16} className="text-brand-green shrink-0" />
            <span>Unlocks earnings withdrawals and Stripe payouts</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
            <CheckCircle2 size={16} className="text-brand-green shrink-0" />
            <span>Encrypted & secure document storage</span>
          </div>
        </div>

        {/* Subtitle helper note */}
        {allowSkipKyc && (
          <p className="text-[11px] text-slate-400 mt-4 text-center">
            You can also complete this anytime from your <span className="font-semibold text-slate-600">Profile Settings</span> or <span className="font-semibold text-slate-600">/kyc</span>.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default KycPromptModal;
