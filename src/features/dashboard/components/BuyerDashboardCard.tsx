"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { DashboardPackageItem } from "../data/mockBuyerDashboard";

interface BuyerDashboardCardProps {
  pkg: DashboardPackageItem;
}

export const BuyerDashboardCard: React.FC<BuyerDashboardCardProps> = ({ pkg }) => {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const fallbackCover = "/images/mock-gigs/thumb-1.png";
  const fallbackAvatar = "/media/noavatar.png";

  return (
    <Link
      href={`/package/${pkg.id}`}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Cover Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <Image
            src={imgError ? fallbackCover : pkg.coverImage}
            alt={pkg.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            unoptimized
          />
        </div>

        {/* Overlapping Seller Avatar */}
        <div className="-mt-5 ml-4 relative z-10">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm bg-gray-100 relative">
            <Image
              src={avatarError ? fallbackAvatar : pkg.seller.avatar}
              alt={pkg.seller.username}
              fill
              sizes="40px"
              className="object-cover"
              onError={() => setAvatarError(true)}
              unoptimized
            />
          </div>
        </div>

        {/* Card Body */}
        <div className="px-4 pt-2.5 pb-2">
          {/* Seller Name & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-[13px] text-gray-900 truncate">
                {pkg.seller.username}
              </span>
              {pkg.badge && (
                <span className="bg-[#856404]/10 text-[#856404] text-[10px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0">
                  {pkg.badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 text-xs font-medium text-gray-500">
              <span>({pkg.reviewCount})</span>
              <span className="font-bold text-gray-900">{pkg.rating.toFixed(1)}</span>
              <FaStar className="text-amber-400 text-[11px]" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[13px] font-normal text-gray-700 line-clamp-2 leading-relaxed group-hover:text-[#327C73] transition-colors">
            {pkg.title}
          </h3>
        </div>
      </div>

      {/* Footer / Price */}
      <div className="px-4 pt-2 pb-4 border-t border-gray-50 mt-1 flex items-baseline gap-1">
        <span className="text-xs text-gray-400 font-normal">Starting from</span>
        <span className="font-bold text-gray-900 text-[15px]">${pkg.price}</span>
      </div>
    </Link>
  );
};

export default BuyerDashboardCard;
