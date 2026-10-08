"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useUserStore } from "@/store/userStore";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { saveSellerOnboardingCategories } from "@/features/seller/onboarding/services/sellerOnboardingService";

// Clean fallback category list in case admin categories are loading or empty
const FALLBACK_CATEGORIES = [
  "Graphics & Design",
  "Programming & Tech",
  "Digital Marketing",
  "Video & Animation",
  "Writing & Translation",
  "Music & Audio",
  "Business & Consulting",
  "AI Services & Development",
  "Data & Analytics",
  "Photography & Media",
  "UI/UX & Web Design",
  "Mobile App Development",
];

export default function SellerOnboardingPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const { parentCategories, isLoading: isCategoriesLoading } = useAdminCategories();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize from user's current categories if already set
  useEffect(() => {
    if (user?.categories && Array.isArray(user.categories) && user.categories.length > 0) {
      setSelectedCategories(user.categories);
    }
  }, [user]);

  // Combine dynamic categories with fallback, deduplicated by label
  const categoryNames = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(parentCategories) && parentCategories.length > 0) {
      parentCategories.forEach((cat) => {
        const name = typeof cat === "string" ? cat : cat.name || cat.title;
        if (name && !list.includes(name)) {
          list.push(name);
        }
      });
    }
    FALLBACK_CATEGORIES.forEach((name) => {
      if (!list.includes(name)) {
        list.push(name);
      }
    });
    return list;
  }, [parentCategories]);

  // Toggle selection
  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catName)) {
        return prev.filter((item) => item !== catName);
      } else {
        if (prev.length >= 5) {
          toast.error("You can select up to 5 categories");
          return prev;
        }
        return [...prev, catName];
      }
    });
  };

  // Submit onboarding selections
  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category to proceed");
      return;
    }

    if (selectedCategories.length > 5) {
      toast.error("You can select a maximum of 5 categories");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveSellerOnboardingCategories(selectedCategories);

      if (result.success) {
        toast.success("Categories saved! Next, let's verify your identity.");
        router.replace("/kyc");
      } else {
        toast.error(result.error || "Failed to save categories. Please try again.");
      }
    } catch (err: any) {
      console.error("Error saving seller categories:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save categories. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAFAFA] font-sans selection:bg-[#0D6D5F]/20 selection:text-[#0D6D5F]">
      {/* Left Panel */}
      <div className="w-full lg:w-[42%] xl:w-[38%] bg-white flex flex-col justify-between p-6 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-gray-100 shrink-0">
        {/* Brand Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Image
              src="/Workvence-logo-Horizontal3.png"
              alt="Workvence"
              width={209}
              height={44}
              priority
              className="w-[209px] h-[44px] object-contain transition-opacity group-hover:opacity-90"
              style={{ width: 209, height: 44 }}
            />
          </Link>
        </div>

        {/* Center Marketing Headline */}
        <div className="my-10 lg:my-auto max-w-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-gray-950 leading-[1.15]">
            Let&apos;s make your{" "}
            <span className="text-gray-400 font-normal">first sale</span> feel
            easy.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-500 leading-relaxed">
            Select the categories that best describe your craft and expertise. A
            few thoughtful details help us recommend the right clients, match you
            with relevant briefs, and keep every transaction safe.
          </p>
        </div>

        {/* Bottom Safety / Trust Assurance */}
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-400 pt-4">
          <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Your information is secure and safe with us.</span>
        </div>
      </div>

      {/* Right Panel / Background Glow Container */}
      <div className="flex-1 min-h-screen p-6 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-white">
        {/* Glow circle background */}
        <div
          className="absolute pointer-events-none select-none rounded-full"
          style={{
            width: "1246px",
            height: "1246px",
            borderRadius: "1246px",
            background: "var(--Foundation-Green-green-100, #B8DFDF)",
            filter: "blur(250px)",
            bottom: "calc(-1246px * 0.70)",
            left: "50%",
            transform: "translateX(-40%)",
          }}
          aria-hidden="true"
        />

        {/* Center content */}
        <div className="w-full max-w-2xl my-auto relative z-10 py-6">
          {/* Step Counter */}
          <div className="text-xs sm:text-sm font-semibold text-gray-400 tracking-wide uppercase mb-2">
            Step 1 of 1
          </div>

          {/* Prompt Heading */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Select your service categories
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-8">
            Choose between 1 and 5 categories that describe your craft and services.
          </p>

          {/* Category Pills */}
          {isCategoriesLoading ? (
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-32 rounded-xl bg-gray-100 animate-pulse border border-gray-200/50"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {categoryNames.map((catName) => {
                const isSelected = selectedCategories.includes(catName);
                const isMaxReached = selectedCategories.length >= 5 && !isSelected;
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => toggleCategory(catName)}
                    className={`group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#F0FDF4] border-[#0D6D5F] text-[#0D6D5F] shadow-xs"
                        : isMaxReached
                        ? "bg-white border-gray-200 text-gray-400 hover:border-gray-200 opacity-60"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/70"
                    }`}
                  >
                    {/* Check / Radio Circle */}
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#0D6D5F] text-white"
                          : "border border-gray-300 group-hover:border-gray-400 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>

                    {/* Category Label */}
                    <span className="truncate">{catName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Bar: Selection Feedback & Submit Button */}
        <div className="w-full max-w-2xl relative z-10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Feedback */}
          <div className="text-xs sm:text-sm font-medium">
            {selectedCategories.length === 0 ? (
              <span className="text-amber-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Select at least 1 category to continue (max 5)
              </span>
            ) : (
              <span className="text-[#0D6D5F] flex items-center gap-1.5">
                <Check className="w-4 h-4 shrink-0" />
                {selectedCategories.length} / 5{" "}
                {selectedCategories.length === 1
                  ? "category selected"
                  : "categories selected"}
              </span>
            )}
          </div>

          {/* Next Button */}
          <button
            type="button"
            id="onboarding-next-btn"
            onClick={handleSubmit}
            disabled={selectedCategories.length === 0 || isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-black hover:bg-gray-900 active:scale-[0.98] text-white text-xs sm:text-sm font-medium transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
