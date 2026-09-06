"use client";

import React from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { SellerGigItem, SELLER_FALLBACK_IMAGES } from "../utils/sellerProfileNormalizer";

interface SellerGigsGridProps {
  gigs: SellerGigItem[];
}

export const SellerGigsGrid: React.FC<SellerGigsGridProps> = ({ gigs }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {gigs.map((gig) => {
          const href = `/package/${gig.slug || gig.id}`;
          return (
            <Link
              key={gig.id}
              href={href}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-gray-200 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* 1. Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-950">
                  <img
                    src={gig.image || SELLER_FALLBACK_IMAGES.gigCover}
                    alt={gig.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = SELLER_FALLBACK_IMAGES.gigCover;
                    }}
                  />
                </div>

                {/* 2. Content */}
                <div className="p-4 sm:p-5">
                  {/* Category & Rating Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold font-sf-pro text-gray-900 tracking-tight">
                      {gig.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-sf-pro">
                      <span className="text-gray-400 font-normal">({gig.reviewCount})</span>
                      <span className="font-bold text-gray-900">{gig.rating.toFixed(1)}</span>
                      <FaStar className="w-3 h-3 text-[#F5B400] fill-[#F5B400]" />
                    </div>
                  </div>

                  {/* Gig Title */}
                  <h3 className="text-[13.5px] sm:text-[14px] text-gray-700 font-medium font-sf-pro leading-snug line-clamp-2 min-h-[38px] group-hover:text-black transition-colors">
                    {gig.title}
                  </h3>
                </div>
              </div>

              {/* 3. Bottom Starting Price Row */}
              <div className="px-4 sm:px-5 pb-4 pt-1 flex items-baseline gap-1.5">
                <span className="text-xs text-gray-500 font-normal">
                  Starting from
                </span>
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  ${gig.startingPrice}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SellerGigsGrid;
