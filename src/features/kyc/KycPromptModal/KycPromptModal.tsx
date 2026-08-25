"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, ShieldCheck, ArrowRight, X, Lock, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export const KycPromptModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  // Check if KYC prompt is enabled via env
  const isKycPromptEnabled = process.env.NEXT_PUBLIC_ENABLE_KYC_PROMPT !== "false";
  const allowSkipKyc = process.env.NEXT_PUBLIC_ALLOW_SKIP_KYC !== "false";

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

    // Check if user is a seller and is not verified
    const isSeller = Boolean(currentUser.isSeller);
    const isVerified = currentUser.isKycVerified === true;

    // Don't show modal if already on kyc, auth, or admin pages
    const isExcludedPage = 
      pathname === "/kyc" || 
      pathname === "/settings/verification" || 
      pathname.startsWith("/admin") || 
      pathname === "/login" || 
      pathname === "/register" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password";

    const userKey = currentUser.id || currentUser._id || currentUser.username || "default";
    const sessionDismissed = sessionStorage.getItem(`kyc_prompt_dismissed_${userKey}`);

    if (isSeller && !isVerified && !isExcludedPage && !sessionDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [user, pathname, isKycPromptEnabled]);

  const handleDismiss = () => {
    const userKey = user?.id || user?._id || user?.username || "default";
    sessionStorage.setItem(`kyc_prompt_dismissed_${userKey}`, "true");
    setIsOpen(false);
  };

  const handleGoToKyc = () => {
    handleDismiss();
    router.push("/kyc");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Decorative Background Gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-50 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Skip button (if allowed) */}
        {allowSkipKyc && (
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Skip for now"
          >
            <X size={20} />
          </button>
        )}

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center mb-5 text-brand-green shadow-xs">
          <ShieldAlert size={32} strokeWidth={2.2} />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Verify Your Seller Identity
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          To maintain a safe marketplace and unlock instant earnings payouts, please complete a fast one-time identity verification.
        </p>

        {/* Benefits List */}
        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-left space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
            <CheckCircle2 size={16} className="text-brand-green shrink-0" />
            <span>Unlocks earnings withdrawals and Stripe payouts</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
            <CheckCircle2 size={16} className="text-brand-green shrink-0" />
            <span>Encrypted & secure document storage</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {allowSkipKyc && (
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Skip for Now
            </button>
          )}

          <button
            type="button"
            onClick={handleGoToKyc}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-brand-green hover:bg-[#389115] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Verify Identity Now</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Subtitle helper note */}
        {allowSkipKyc && (
          <p className="text-[11px] text-slate-400 mt-4">
            You can also complete this anytime from your <span className="font-semibold text-slate-600">Profile Settings</span> or <span className="font-semibold text-slate-600">/kyc</span>.
          </p>
        )}
      </div>
    </div>
  );
};

export default KycPromptModal;
