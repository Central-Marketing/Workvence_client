"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { calculateProfileCompletion } from "../utils/dashboardNormalizer";

interface SellerDashboardProps {
  user: any;
  onSwitchToBuyer?: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ user }) => {
  const router = useRouter();

  // Fetch seller's packages
  const { data: packages = [] } = useQuery({
    queryKey: ["my-packages"],
    queryFn: () =>
      axiosFetch(`/gigs?userID=${user?._id || user?.id}`)
        .then(({ data }) => (Array.isArray(data) ? data : []))
        .catch(() => []),
    enabled: !!user,
  });

  const completionPercentage = calculateProfileCompletion(user) || 50;
  const packagesList = Array.isArray(packages) ? packages : [];
  const hasPackages = packagesList.length > 0;
  const displayName = user?.name ? user.name.split(" ")[0] : (user?.username || "Tomas");

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-8 sm:py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-6 sm:space-y-7">

        {/* 1. Header: Welcome & Profile Completion (Shown by default) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl sm:text-[26px] text-[#555E68] font-normal tracking-tight">
              Welcome to Workvence, <span className="font-bold text-black">{displayName}</span>
            </h1>
          </div>

          {/* Profile Completion Bar */}
          <Link
            href="/profile"
            className="flex flex-col items-start sm:items-end gap-1.5 group cursor-pointer self-start sm:self-auto"
          >
            <div className="flex items-center gap-3 text-[11px] sm:text-xs">
              <span className="text-[#374151] group-hover:text-teal-600 transition-colors underline underline-offset-2">
                Complete your profile
              </span>
              <span className="font-bold text-[#111827]">{completionPercentage}%</span>
            </div>
            <div className="w-[170px] sm:w-[200px] h-[5px] bg-[#E9EBEF] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00E575] to-[#00E3A2] rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </Link>
        </div>

        {/* 2. Card 1: Ready to Grow Your Business? (Shown by default) */}
        <div className="bg-white rounded-[18px] sm:rounded-[22px] border border-[#EBECEF] p-8 sm:py-12 sm:px-12 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="w-[140px] sm:w-[165px] h-auto mb-3.5 flex items-center justify-center">
            <img
              src="/images/dashboard/seller_grow_exact.png"
              alt="Ready to Grow Your Business?"
              className="w-full h-auto object-contain"
            />
          </div>
          <h2 className="text-lg sm:text-[22px] font-bold text-[#111827] mb-2 tracking-tight">
            Ready to Grow Your Business?
          </h2>
          <p className="text-[#6B7280] text-xs sm:text-[13px] max-w-[480px] mx-auto leading-relaxed mb-6">
            Showcase your expertise, connect with the right clients, and turn your skills into meaningful opportunities on WorkVench.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/briefs"
              className="px-5 py-2.5 rounded-lg bg-[#EFEFEF] hover:bg-[#E5E5E5] text-[#1F2937] text-xs sm:text-[13px] font-semibold transition-colors"
            >
              Explore Projects
            </Link>
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs sm:text-[13px] font-semibold transition-colors"
            >
              Complete Profile
            </Link>
          </div>
        </div>

        {/* 3. Section 2: Packages (Shown on length: when packages exist) */}
        {hasPackages && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-[24px] font-bold text-[#111827] tracking-tight">
                Packages <span className="text-sm font-normal text-slate-500">({packagesList.length})</span>
              </h2>
              <div className="flex items-center gap-3">
                <Link
                  href="/my-packages"
                  className="text-xs sm:text-sm font-semibold text-[#327C73] hover:underline"
                >
                  Manage All
                </Link>
                <Link
                  href="/organize"
                  className="px-4 py-2 rounded-lg bg-brand-green hover:bg-brand-green/90 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  + Add New Package
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {packagesList.map((pkg: any) => (
                <div
                  key={pkg._id}
                  onClick={() => router.push(`/package/${pkg._id}`)}
                  className="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={pkg.cover || pkg.image || "/images/mock-dashboard/rec-1.png"}
                      alt={pkg.title || "Package"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {pkg.title}
                    </h3>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                      <span className="text-slate-500">
                        Sales: <strong className="text-slate-700">{pkg.sales || 0}</strong>
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        {(pkg.price || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SellerDashboard;
