"use client";

import React from "react";
import Link from "next/link";
import { FiHome } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { SELLER_FALLBACK_IMAGES } from "../utils/sellerProfileNormalizer";

interface SellerHeroBannerProps {
  name: string;
  avatar: string;
  banner?: string;
  isPro?: boolean;
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
  isPro = true,
  role,
  rating,
  reviewCount,
  categoryName = "Graphics",
  subcategoryName = "Logo & Brand Identity",
}) => {
  return (
    <div className="w-full mb-8">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-gray-500 mb-4">
        <Link
          href="/"
          className="text-teal-600 hover:text-teal-700 transition-colors flex items-center"
          title="Home"
        >
          <FiHome className="w-4 h-4" />
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/packages?category=${encodeURIComponent(categoryName.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"))}`}
          className="text-gray-600 hover:text-gray-900 transition-colors font-normal"
        >
          {categoryName}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 font-normal truncate">
          {subcategoryName}
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium truncate">
          {name}
        </span>
      </nav>

      {/* 2. Panoramic Hero Banner */}
      <div className="relative w-full h-[160px] sm:h-[190px] md:h-[220px] rounded-[10px]  overflow-hidden bg-gray-950 shadow-xs border border-gray-900/10">
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-sf-pro text-gray-900 tracking-tight">
              {name}
            </h1>
            {isPro && (
              <span className="bg-[#360083] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] tracking-wide uppercase">
                Pro
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-sf-pro">
            <span className="text-gray-700 font-medium">{role}</span>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <span>{rating.toFixed(1)}</span>
              <FaStar className="w-3.5 h-3.5 text-[#F5B400] fill-[#F5B400]" />
              <span className="text-gray-400 font-normal">({reviewCount})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHeroBanner;
