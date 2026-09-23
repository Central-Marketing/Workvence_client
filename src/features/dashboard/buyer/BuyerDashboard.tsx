"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { PackageCard } from "@/features/gigs";
import { calculateProfileCompletion } from "../utils/dashboardNormalizer";

interface BuyerDashboardProps {
  user: any;
  onSwitchToSeller?: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, onSwitchToSeller }) => {
  const popularScrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Recommended Packages from backend API
  const { data: recommendedData } = useQuery({
    queryKey: ["buyer-recommended-packages"],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get("/gigs?limit=4");
        return data;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });

  // 2. Fetch Most Popular Packages sorted by sales from backend API
  const { data: popularData } = useQuery({
    queryKey: ["buyer-popular-packages"],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get("/gigs?sort=sales&limit=8");
        return data;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });

  const recommendedList = React.useMemo(() => {
    if (Array.isArray(recommendedData)) return recommendedData;
    if (Array.isArray(recommendedData?.gigs)) return recommendedData.gigs;
    if (Array.isArray(recommendedData?.packages)) return recommendedData.packages;
    if (Array.isArray(recommendedData?.data)) return recommendedData.data;
    return [];
  }, [recommendedData]);

  const popularList = React.useMemo(() => {
    const list = Array.isArray(popularData)
      ? popularData
      : Array.isArray(popularData?.gigs)
        ? popularData.gigs
        : Array.isArray(popularData?.packages)
          ? popularData.packages
          : Array.isArray(popularData?.data)
            ? popularData.data
            : [];
    // If backend returns popular gigs, use them; otherwise fallback to recommended list
    return list.length > 0 ? list : recommendedList;
  }, [popularData, recommendedList]);

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
    <div className="min-h-screen bg-[#FAFAFA] pt-8 sm:pt-10 md:pt-12 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto px-4 md:px-6 space-y-10 md:space-y-12">

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Greeting */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-[38px] font-normal text-gray-800 tracking-tight leading-tight">
              Welcome to Workvence, <span className="font-extrabold text-gray-950">{userDisplayName}</span>
            </h1>
            {/* {user?.isSeller && onSwitchToSeller && (
              <Button
                variant="ghost"
                size="xs"
                onClick={onSwitchToSeller}
                className="mt-2 text-xs font-semibold text-[#327C73] hover:underline flex items-center gap-1 cursor-pointer p-0 h-auto"
              >
                Switch to Seller Dashboard →
              </Button>
            )} */}
          </div>

          {/* Complete Your Profile Bar */}
          <div className="flex flex-col items-start md:items-end shrink-0">
            {completionPercentage >= 100 ? (
              <div className="flex items-center justify-between w-56 sm:w-64 text-xs sm:text-sm font-semibold text-emerald-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Profile 100% Completed
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-56 sm:w-64 text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                <Link href="/profile" className="underline hover:text-[#327C73] transition-colors">
                  Complete your profile
                </Link>
                <span className="font-bold text-gray-900">{completionPercentage}%</span>
              </div>
            )}
            <div className="w-56 sm:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${completionPercentage >= 100 ? "bg-emerald-500 w-full" : "bg-[#00E599]"
                  }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero Card: Start Your Journey */}
        <div className="bg-white border border-gray-100 rounded-[6px] p-8 sm:p-12 md:p-14 text-center shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
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
            <Button
              href="/briefs"
              variant="soft"
              size="md"
              radius="fiverr"
              className="bg-[#EFEFEF] hover:bg-gray-200 text-gray-800"
            >
              Explore Projects
            </Button>
            <Button
              href="/packages?category=ai-services"
              variant="dark"
              size="md"
              radius="fiverr"
            >
              Browse Packages
            </Button>
          </div>
        </div>

        {/* Section 1: Recommended for You */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
              Recommended for You
            </h2>
            <Link
              href="/packages?category=ai-services"
              className="text-[#327C73] hover:underline font-semibold text-sm flex items-center gap-1 group"
            >
              <span>Explore Packages</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {recommendedList.map((pkg: any) => (
              <PackageCard key={pkg._id || pkg.id} data={pkg} />
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
              <Button
                type="button"
                onClick={handleScrollLeft}
                aria-label="Previous popular packages"
                variant="soft"
                size="icon"
                radius="full"
                className="w-8 h-8 min-w-[32px] min-h-[32px] bg-[#F5F5F7] hover:bg-gray-200 text-gray-700 p-0"
                icon={<FiArrowLeft className="text-sm" />}
              />
              <Button
                type="button"
                onClick={handleScrollRight}
                aria-label="Next popular packages"
                variant="soft"
                size="icon"
                radius="full"
                className="w-8 h-8 min-w-[32px] min-h-[32px] bg-[#F5F5F7] hover:bg-gray-200 text-gray-700 p-0"
                icon={<FiArrowRight className="text-sm" />}
              />
            </div>
          </div>

          <div
            ref={popularScrollRef}
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-0"
          >
            {popularList.map((pkg: any) => (
              <div key={pkg._id || pkg.id} className="min-w-[270px] sm:min-w-0 flex-1">
                <PackageCard data={pkg} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default BuyerDashboard;
