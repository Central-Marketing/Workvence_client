"use client";

import React from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { MockSeller } from "@/data/mockSellers";

interface SellerCardProps {
  seller: MockSeller;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  return (
    <div className="bg-white border border-gray-200/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-gray-300 transition-all group">
      <div>
        {/* Top Row: Avatar on Left + Rating on Right */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100 shrink-0">
            <img
              src={seller.avatar}
              alt={seller.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/mock-package/avatar-seller.png";
              }}
            />
          </div>

          <div className="flex items-center gap-1 text-xs font-sf-pro pt-1">
            <span className="font-bold text-gray-900 text-[13.5px]">
              {seller.rating.toFixed(1)}
            </span>
            <FaStar className="w-3 h-3 text-[#F5B400] fill-[#F5B400]" />
            <span className="text-gray-400 font-normal">
              ({seller.reviewCount})
            </span>
          </div>
        </div>

        {/* Middle Section: Name & Badge + Role */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold font-sf-pro text-gray-900 text-[15px] group-hover:text-black transition-colors">
              {seller.name}
            </h3>

            {seller.badge === "Pro" && (
              <span className="bg-[#360083] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] tracking-wide uppercase shrink-0">
                Pro
              </span>
            )}

            {seller.badge === "Basic" && (
              <span className="bg-[#6B5A00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] tracking-wide uppercase shrink-0">
                Basic
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 font-sf-pro font-normal mt-1">
            {seller.role}
          </p>
        </div>
      </div>

      {/* Bottom Button: View Profile */}
      <Link
        href={`/seller/${seller.username}`}
        className="w-full py-2.5 bg-[#EEEEEE] hover:bg-gray-200 text-gray-700 text-xs sm:text-[13px] font-semibold font-sf-pro rounded-xl text-center transition-colors block cursor-pointer active:scale-[0.98]"
      >
        View Profile
      </Link>
    </div>
  );
};

export default SellerCard;
