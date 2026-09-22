"use client";

import React from "react";
import Link from "next/link";
import { FiHome } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Breadcrumb } from "@/components/ui";
import { SELLER_FALLBACK_IMAGES } from "../utils/sellerProfileNormalizer";

interface SellerHeroBannerProps {
  name: string;
  avatar: string;
  banner?: string;
  isPro?: boolean;
  isSeller?: boolean;
  sellerLevel?: string;
  role: string;
  rating: number;
  reviewCount: number;
  categoryName?: string;
  subcategoryName?: string;
}

export const SellerHeroBanner: React.FC<SellerHeroBannerProps> = ({
  name,
  avatar,
  banner = SELLER_FALLBACK_IMAGES.banner,
  isPro = false,
  isSeller = true,
  sellerLevel = "Level 1 Seller",
  role,
  rating,
  reviewCount,
  categoryName = "Services",
  subcategoryName,
}) => {
  return (
    <div className="w-full mb-8">
      {/* 1. Breadcrumbs */}
      <Breadcrumb
        items={[
          {
            name: categoryName,
            href: `/packages?category=${encodeURIComponent(categoryName.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"))}`,
          },
          ...(subcategoryName
            ? [
                {
                  name: subcategoryName,
                },
              ]
            : []),
          {
            name,
            isLast: true,
          },
        ]}
      />

      {/* 2. Panoramic Hero Banner */}
      <div className="relative w-full h-[160px] sm:h-[190px] md:h-[220px] rounded-[6px]  overflow-hidden bg-gray-950 shadow-xs border border-gray-900/10">
        <img
          src={banner || SELLER_FALLBACK_IMAGES.banner}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = SELLER_FALLBACK_IMAGES.fallbackBanner;
          }}
        />
      </div>

      {/* 3. Overlapping Avatar & Seller Meta Header (Stacked Vertically) */}
      <div className="relative z-10 px-4 sm:px-6">
        {/* Avatar overlapping banner */}
        <div className="relative -mt-10 sm:-mt-12 md:-mt-14 mb-3 inline-block">
          <img
            src={avatar || SELLER_FALLBACK_IMAGES.avatar}
            alt={name}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-[3.5px] border-white shadow-md bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).src = SELLER_FALLBACK_IMAGES.avatar;
            }}
          />
        </div>

        {/* Name, Pro Badge, Role & Rating (at the bottom of the avatar) */}
        <div className="mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold font-sf-pro text-gray-900 tracking-tight">
              {name}
            </h1>
            {isSeller && sellerLevel && (
              <span className="bg-[#360083] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-[6px] tracking-wide">
                {sellerLevel}
              </span>
            )}
            {isPro && (
              <span className="bg-[#360083] text-white text-[10px] font-bold px-2 py-0.5 rounded-[6px] tracking-wide uppercase">
                Pro
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-sf-pro">
            {role && <span className="text-gray-700 font-medium">{role}</span>}
            {role && reviewCount > 0 && <span className="text-gray-300">·</span>}
            {reviewCount > 0 && (
              <div className="flex items-center gap-1 font-semibold text-gray-900">
                <span>{rating.toFixed(1)}</span>
                <FaStar className="w-3.5 h-3.5 text-[#F5B400] fill-[#F5B400]" />
                <span className="text-gray-400 font-normal">({reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHeroBanner;
