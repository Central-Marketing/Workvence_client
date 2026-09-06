"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import BuyerDashboardCard from "../components/BuyerDashboardCard";
import {
  MOCK_RECOMMENDED_PACKAGES,
  MOCK_POPULAR_PACKAGES,
  DashboardPackageItem,
} from "../data/mockBuyerDashboard";
import {
  normalizeDashboardPackageList,
  calculateProfileCompletion,
} from "../utils/dashboardNormalizer";

interface BuyerDashboardProps {
  user: any;
  onSwitchToSeller?: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, onSwitchToSeller }) => {
  const popularScrollRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic packages from backend API
  const { data: apiPackages } = useQuery({
    queryKey: ["buyer-dashboard-packages"],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get("/gigs?limit=12");
        return data;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });

  const recommendedList: DashboardPackageItem[] = normalizeDashboardPackageList(
    apiPackages,
    MOCK_RECOMMENDED_PACKAGES
  );

  const popularList: DashboardPackageItem[] = normalizeDashboardPackageList(
    apiPackages ? apiPackages.slice(4) : null,
    MOCK_POPULAR_PACKAGES
  );

  const completionPercentage = calculateProfileCompletion(user);

  // Extract first name or username
  const userDisplayName =
    user?.name?.split(" ")[0] ||
    user?.username ||
    "Jonas";

  const handleScrollLeft = () => {
    if (popularScrollRef.current) {
      popularScrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (popularScrollRef.current) {
      popularScrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 md:px-6 space-y-10 md:space-y-12">

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Greeting */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-[38px] font-normal text-gray-800 tracking-tight leading-tight">
              Welcome to Workvence, <span className="font-extrabold text-gray-950">{userDisplayName}</span>
            </h1>
            {user?.isSeller && onSwitchToSeller && (
              <button
                onClick={onSwitchToSeller}
                className="mt-2 text-xs font-semibold text-[#327C73] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Switch to Seller Dashboard →
              </button>
            )}
          </div>

          {/* Complete Your Profile Bar */}
          <div className="flex flex-col items-start md:items-end shrink-0">
            <div className="flex items-center justify-between w-56 sm:w-64 text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
              <Link href="/profile" className="underline hover:text-[#327C73] transition-colors">
                Complete your profile
              </Link>
              <span className="font-bold text-gray-900">{completionPercentage}%</span>
            </div>
            <div className="w-56 sm:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00E599] rounded-full transition-all duration-700"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero Card: Start Your Journey */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 md:p-14 text-center shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
          {/* Illustration */}
          <div className="relative w-36 h-24 mb-4 flex items-center justify-center">
            <Image
              src="/images/mock-dashboard/hero-journey.png"
              alt="Start Your Journey"
              width={140}
              height={90}
              className="object-contain"
              priority
              unoptimized
            />
          </div>

          {/* Text Content */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2.5">
            Start Your Journey
          </h2>
          <p className="text-gray-500 text-sm sm:text-[15px] font-normal max-w-lg mx-auto mb-8 leading-relaxed">
            Explore projects, connect with talented freelancers, and discover everything WorkVenc has to offer.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/briefs"
              className="bg-[#EFEFEF] hover:bg-gray-200 text-gray-800 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Explore Projects
            </Link>
            <Link
              href="/seller"
              className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              Browse Freelancers
            </Link>
          </div>
        </div>

        {/* Section 1: Recommended for You */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
              Recommended for You
            </h2>
            <Link
              href="/packages"
              className="text-[#327C73] hover:underline font-semibold text-sm flex items-center gap-1 group"
            >
              <span>Explore Packages</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {recommendedList.slice(0, 4).map((pkg) => (
              <BuyerDashboardCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>

        {/* Section 2: Most Popular Packages */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
              Most Popular Packages
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleScrollLeft}
                aria-label="Previous popular packages"
                className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiArrowLeft className="text-sm" />
              </button>
              <button
                onClick={handleScrollRight}
                aria-label="Next popular packages"
                className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiArrowRight className="text-sm" />
              </button>
            </div>
          </div>

          <div
            ref={popularScrollRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2"
          >
            {popularList.slice(0, 4).map((pkg) => (
              <BuyerDashboardCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default BuyerDashboard;
