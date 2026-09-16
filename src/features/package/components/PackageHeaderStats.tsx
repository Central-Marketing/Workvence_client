"use client";

import React from "react";
import Link from "next/link";
import { FiHome, FiHeart, FiShare2, FiMoreVertical, FiShield, FiClock, FiAward, FiRepeat } from "react-icons/fi";
import { FaAward, FaStar } from "react-icons/fa";
import { SellerDetails } from "../utils/packageDetailsNormalizer";
import { BadgeCheck } from "lucide-react";

interface PackageHeaderStatsProps {
  title: string;
  categoryName: string;
  subcategoryName?: string;
  seller: SellerDetails;
  isFavorited?: boolean;
  favoriteCount?: number;
  onToggleFavorite?: () => void;
  onShare?: () => void;
}

export const PackageHeaderStats: React.FC<PackageHeaderStatsProps> = ({
  title,
  categoryName,
  subcategoryName,
  seller,
  isFavorited = false,
  favoriteCount = 0,
  onToggleFavorite,
  onShare,
}) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    seller.name || "Seller"
  )}&background=0D9488&color=fff&bold=true`;

  return (
    <div className="w-full mb-6">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-gray-500 mb-3.5 flex-wrap">
        <Link
          href="/"
          className="text-teal-600 hover:text-teal-700 transition-colors flex items-center"
          title="Home"
        >
          <FiHome className="w-4 h-4" />
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/packages?category=${encodeURIComponent(categoryName.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-'))}`}
          className="text-gray-600 hover:text-gray-900 transition-colors font-normal"
        >
          {categoryName}
        </Link>
        {subcategoryName && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 font-normal truncate">
              {subcategoryName}
            </span>
          </>
        )}
      </nav>

      {/* 2. Main Title */}
      <h1 className="text-[26px] sm:text-[32px] md:text-[44px] font-[590] font-sf-pro text-[#292929] leading-tight mb-4">
        {title}
      </h1>

      {/* 3. Seller Meta Bar + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href={`/seller/${seller.username || seller.name}`}
            className="shrink-0 group block"
            title={`View ${seller.name}'s profile`}
          >
            <img
              src={seller.avatar || defaultAvatar}
              alt={seller.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </Link>
          <div className="flex items-start gap-1 flex-col">
            <div className="flex items-center gap-2">
              <Link
                href={`/seller/${seller.username || seller.name}`}
                className="font-[510] text-black font-sf-pro text-xl sm:text-2xl hover:text-brand-green transition-colors"
                title={`View ${seller.name}'s profile`}
              >
                {seller.name}
              </Link>
              {seller.isPro && (
                <span className="bg-[#360083] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] tracking-wide uppercase">
                  Pro
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-black text-sm sm:text-base font-sf-pro font-[510]">{seller.role}</span>
              <span className="text-gray-400 text-sm"> | </span>
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                <span className="text-base sm:text-lg font-sf-pro font-bold">
                  {seller.rating > 0 ? seller.rating.toFixed(1) : "New"}
                </span>
                <FaStar className="w-4 h-4 text-[#F5B400] fill-[#F5B400]" />
                <span className="text-[#868686] text-sm sm:text-base font-sf-pro font-normal">
                  ({seller.reviewCount})
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="text-[#4A4A4A] font-normal font-sf-pro text-base sm:text-xl">
            {seller.ordersInQueue > 0 ? (
              <>
                <strong className="text-[#222222] font-semibold">{seller.ordersInQueue} </strong> orders in queue
              </>
            ) : (
              <span className="text-emerald-700 font-medium">Available now</span>
            )}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors cursor-pointer hover:bg-gray-50 ${isFavorited ? 'text-red-500 bg-red-50/50 border-red-200' : 'text-gray-500'
                }`}
              title="Save to favorites"
            >
              <FiHeart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onShare}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              title="Share"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Seller Stats */}
      <div className="w-full h-[86px] bg-[#F5F5F5] border border-[#DADADA] rounded-[10px] overflow-hidden flex mb-6">
        {/* Card 1 */}
        <div className="flex-1 h-[84px] px-5 flex items-center gap-4 border-r border-black/10">
          <div className="w-9 h-9 rounded-[10] border-[#0000001A] bg-[#FAFAFA] text-[#5568AB] flex items-center justify-center shrink-0">
            <BadgeCheck className="w-4 h-4" />
          </div>

          <div>
            <span className="text-base font-sf-pro  text-[#6E6E6E] block font-normal">
              Profile Status
            </span>
            <span className="text-xl sm:text-2xl font-sf-pro font-bold text-black">
              {seller.verified ? "Verified" : "Active"}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex-1 h-[84px] px-5 flex items-center gap-4 border-r border-black/10">
          <div className="w-9 h-9 rounded-[10] border-[#0000001A] bg-[#FAFAFA] text-[#F57727] flex items-center justify-center shrink-0">
            <FiClock className="w-4 h-4" />
          </div>

          <div>
            <span className="text-base font-sf-pro  text-[#6E6E6E] block font-normal">
              Response Time
            </span>
            <span className="text-xl sm:text-2xl font-sf-pro font-bold text-black">
              {seller.responseTime}
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex-1 h-[84px] px-5 flex items-center gap-4 border-r border-black/10">
          <div className="w-9 h-9 rounded-[10] border-[#0000001A] bg-[#FAFAFA] text-[#54AA54] flex items-center justify-center shrink-0">
            <FaAward className="w-4 h-4" />
          </div>

          <div>
            <span className="text-base font-sf-pro  text-[#6E6E6E] block font-normal">
              Category
            </span>
            <span className="text-lg sm:text-xl font-sf-pro font-bold text-black truncate max-w-[150px]" title={seller.topRatedIn}>
              {seller.topRatedIn}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex-1 h-[84px] px-5 flex items-center gap-4">
          <div className="w-9 h-9 rounded-[10] border-[#0000001A] bg-[#FAFAFA] text-[#9654F4] flex items-center justify-center shrink-0">
            <FiRepeat className="w-4 h-4" />
          </div>

          <div>
            <span className="text-base font-sf-pro  text-[#6E6E6E] block font-normal">
              Completion
            </span>
            <span className="text-xl sm:text-2xl font-sf-pro font-bold text-black">
              {seller.returnRate || seller.onTimeDelivery || "100%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
