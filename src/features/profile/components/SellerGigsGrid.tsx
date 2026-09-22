"use client";

import React from "react";
import { PackageCard } from "@/features/gigs";

interface SellerGigsGridProps {
  gigs: any[];
}

export const SellerGigsGrid: React.FC<SellerGigsGridProps> = ({ gigs }) => {
  if (!gigs || gigs.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-100 rounded-[6px] p-8 sm:p-12 text-center shadow-2xs">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-bold font-sf-pro text-gray-900 mb-1">
          No services published yet
        </h3>
        <p className="text-sm text-gray-500 font-inter max-w-sm mx-auto">
          This seller currently has no active packages available. Check back soon or contact them directly.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 min-[1200px]:grid-cols-3 gap-5">
        {gigs.map((gig, idx) => (
          <PackageCard
            key={gig._id || gig.id || idx}
            data={gig}
            priority={idx < 2}
          />
        ))}
      </div>
    </div>
  );
};

export default SellerGigsGrid;
