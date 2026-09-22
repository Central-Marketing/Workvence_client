"use client";

import React from "react";
import Link from "next/link";
import { FiHome, FiHeart, FiShare2, FiMoreVertical, FiShield, FiClock, FiAward, FiRepeat } from "react-icons/fi";
import { FaAward } from "react-icons/fa";
import { SellerDetails } from "../utils/packageDetailsNormalizer";
import { BadgeCheck } from "lucide-react";
import { Button, Breadcrumb } from "@/components/ui";

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
      <Breadcrumb
        items={[
          {
            name: categoryName,
            href: `/packages?category=${encodeURIComponent(categoryName.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-'))}`,
            isLast: !subcategoryName,
          },
          ...(subcategoryName
            ? [
                {
                  name: subcategoryName,
                  isLast: true,
                },
              ]
            : []),
        ]}
      />

      {/* 2. Main Title */}
      <h1
        className="
    text-[24px]
    min-[400px]:text-[26px]
    sm:text-[28px]
    md:text-[26px]
    lg:text-[28px]
    xl:text-[32px]
    2xl:text-[32px]
    font-[590]
    font-sf-pro
    leading-[1.2]
    text-[var(--Foundation-Grey-grey-800,#292929)]
    not-italic
    mb-4
  "
      >
        {title}
      </h1>

      {/* 3. Seller Meta Bar + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={`/seller/${seller.username || seller.name}`}
            className="shrink-0 group block"
            title={`View ${seller.name}'s profile`}
          >
            <img
              src={seller.avatar || defaultAvatar}
              alt={seller.name}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-[64px] md:h-[64px] aspect-square rounded-full object-cover border border-gray-200 shadow-xs group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </Link>
          <div className="flex items-start gap-1 flex-col">
            <div className="flex items-center gap-2">
              <Link
                href={`/seller/${seller.username || seller.name}`}
                className="font-[510] text-[#000] font-sf-pro text-lg not-italic leading-normal hover:text-brand-green transition-colors"
                title={`View ${seller.name}'s profile`}
              >
                {seller.name}
              </Link>
              {seller.isPro && (
                <span className="inline-flex items-center justify-center px-[10px] py-[2px] gap-[10px] rounded-[4px] bg-[var(--purple-800,#360083)] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                  Pro
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#000] text-sm sm:text-[16px] font-sf-pro font-[510] not-italic leading-normal">{seller.role}</span>
              <span className="text-gray-400 text-sm"> | </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <span className="text-base font-sf-pro font-bold text-[#000] not-italic leading-normal">
                  {seller.rating > 0 ? seller.rating.toFixed(1) : "New"}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
                  <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="#F5B400" />
                </svg>
                <span className="text-[var(--Foundation-Grey-grey-300,#868686)] text-base font-sf-pro font-normal not-italic leading-normal">
                  ({seller.reviewCount})
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-600 flex-wrap justify-between sm:justify-end w-full sm:w-auto">
          <span className="text-[var(--Foundation-Grey-grey-500,#4A4A4A)] font-normal font-sf-pro text-base not-italic leading-normal">
            {seller.ordersInQueue > 0 ? (
              <>
                <strong className="text-[#222222] font-bold">{seller.ordersInQueue} </strong> orders in queue
              </>
            ) : (
              <span className="text-emerald-700 font-medium">Available now</span>
            )}
          </span>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Button
              type="button"
              variant={isFavorited ? "danger-soft" : "outline"}
              size="icon"
              radius="full"
              onClick={onToggleFavorite}
              className={`w-9 h-9 sm:w-10 sm:h-10 !min-h-0 !p-0 aspect-square rounded-[60px] flex items-center justify-center transition-colors cursor-pointer hover:bg-gray-50 shrink-0 ${isFavorited ? '!text-red-500 !bg-red-50/50 !border-red-200' : 'text-gray-500 !bg-white border-gray-200'
                }`}
              title="Save to favorites"
              icon={<FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorited ? 'fill-red-500' : ''}`} />}
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              radius="full"
              onClick={onShare}
              className="w-9 h-9 sm:w-10 sm:h-10 !min-h-0 !p-0 aspect-square rounded-[60px] !bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
              title="Share"
              icon={<FiShare2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            />
          </div>
        </div>
      </div>

      {/* 4. Seller Stats */}
      <div className="w-full mb-6 overflow-hidden rounded-[6px] border border-[#DADADA] bg-[#F5F5F5] grid grid-cols-2 xl:grid-cols-4">

        {/* Card 1: Profile Status */}
        <div className="
          min-h-[72px]
          sm:min-h-[80px]
          xl:h-[84px]
          px-3
          min-[480px]:px-3.5
          sm:px-4
          lg:px-4
          xl:px-3.5
          macbook:px-4
          2xl:px-5
          py-3
          sm:py-3.5
          xl:py-0
          flex items-center
          gap-2
          sm:gap-2.5
          lg:gap-2.5
          xl:gap-2.5
          macbook:gap-3
          2xl:gap-4
          border-b
          border-r
          xl:border-b-0
          border-black/10
        ">
          <div className="
            w-8 h-8
            sm:w-9 sm:h-9
            lg:w-8 lg:h-8
            xl:w-9 xl:h-9
            2xl:w-10 2xl:h-10
            rounded-[6px]
            border border-[#0000001A]
            bg-[#FAFAFA]
            text-[#5568AB]
            flex items-center justify-center
            shrink-0
          ">
            <BadgeCheck className="w-4 h-4 sm:w-[17px] sm:h-[17px] lg:w-4 lg:h-4 xl:w-[17px] xl:h-[17px] 2xl:w-[18px] 2xl:h-[18px]" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="
              text-xs
  macbook:text-[13px]
  2xl:text-[13px]
  font-inter
  font-normal
  leading-tight
  text-[#6E6E6E]
  block
  truncate
            ">
              Profile Status
            </span>

            <span className="
              text-base
  
  font-inter
  font-bold
  leading-tight
  text-black
  block
  truncate
            ">
              {seller.verified ? "Verified" : "Active"}
            </span>
          </div>
        </div>

        {/* Card 2: Response Time */}
        <div className="
          min-h-[72px]
          sm:min-h-[80px]
          xl:h-[84px]
          px-3
          min-[480px]:px-3.5
          sm:px-4
          lg:px-4
          xl:px-3.5
          macbook:px-4
          2xl:px-5
          py-3
          sm:py-3.5
          xl:py-0
          flex items-center
          gap-2
          sm:gap-2.5
          lg:gap-2.5
          xl:gap-2.5
          macbook:gap-3
          2xl:gap-4
          border-b
          xl:border-b-0
          xl:border-r
          border-black/10
        ">
          <div className="
            w-8 h-8
            sm:w-9 sm:h-9
            lg:w-8 lg:h-8
            xl:w-9 xl:h-9
            2xl:w-10 2xl:h-10
            rounded-[6px]
            border border-[#0000001A]
            bg-[#FAFAFA]
            text-[#F57727]
            flex items-center justify-center
            shrink-0
          ">
            <FiClock className="w-4 h-4 sm:w-[17px] sm:h-[17px] lg:w-4 lg:h-4 xl:w-[17px] xl:h-[17px] 2xl:w-[18px] 2xl:h-[18px]" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="
              text-[11px]
              min-[480px]:text-xs
              sm:text-xs
              md:text-xs
              lg:text-[11px]
              xl:text-xs
              macbook:text-[13px]
              2xl:text-sm
              font-inter
              text-[#6E6E6E]
              block
              font-normal
              leading-tight
              truncate
            ">
              Response Time
            </span>

            <span className="
              text-base
  font-inter
  font-bold
  leading-tight
  text-black
  block
  truncate
            ">
              {seller.responseTime}
            </span>
          </div>
        </div>

        {/* Card 3: Category */}
        <div className="
          min-h-[72px]
          sm:min-h-[80px]
          xl:h-[84px]
          px-3
          min-[480px]:px-3.5
          sm:px-4
          lg:px-4
          xl:px-3.5
          macbook:px-4
          2xl:px-5
          py-3
          sm:py-3.5
          xl:py-0
          flex items-center
          gap-2
          sm:gap-2.5
          lg:gap-2.5
          xl:gap-2.5
          macbook:gap-3
          2xl:gap-4
          border-r
          border-black/10
        ">
          <div className="
            w-8 h-8
            sm:w-9 sm:h-9
            lg:w-8 lg:h-8
            xl:w-9 xl:h-9
            2xl:w-10 2xl:h-10
            rounded-[6px]
            border border-[#0000001A]
            bg-[#FAFAFA]
            text-[#54AA54]
            flex items-center justify-center
            shrink-0
          ">
            <FaAward className="w-4 h-4 sm:w-[17px] sm:h-[17px] lg:w-4 lg:h-4 xl:w-[17px] xl:h-[17px] 2xl:w-[18px] 2xl:h-[18px]" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="
              text-[11px]
              min-[480px]:text-xs
              sm:text-xs
              md:text-xs
              lg:text-[11px]
              xl:text-xs
              macbook:text-[13px]
              2xl:text-sm
              font-inter
              text-[#6E6E6E]
              block
              font-normal
              leading-tight
              truncate
            ">
              Category
            </span>

            <span
              className="
                text-base
  
  font-inter
  font-bold
  leading-tight
  text-black
  block
  truncate
              "
              title={seller.topRatedIn}
            >
              {seller.topRatedIn}
            </span>
          </div>
        </div>

        {/* Card 4: Completion */}
        <div className="
          min-h-[72px]
          sm:min-h-[80px]
          xl:h-[84px]
          px-3
          min-[480px]:px-3.5
          sm:px-4
          lg:px-4
          xl:px-3.5
          macbook:px-4
          2xl:px-5
          py-3
          sm:py-3.5
          xl:py-0
          flex items-center
          gap-2
          sm:gap-2.5
          lg:gap-2.5
          xl:gap-2.5
          macbook:gap-3
          2xl:gap-4
        ">
          <div className="
            w-8 h-8
            sm:w-9 sm:h-9
            lg:w-8 lg:h-8
            xl:w-9 xl:h-9
            2xl:w-10 2xl:h-10
            rounded-[6px]
            border border-[#0000001A]
            bg-[#FAFAFA]
            text-[#9654F4]
            flex items-center justify-center
            shrink-0
          ">
            <FiRepeat className="w-4 h-4 sm:w-[17px] sm:h-[17px] lg:w-4 lg:h-4 xl:w-[17px] xl:h-[17px] 2xl:w-[18px] 2xl:h-[18px]" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="
              text-[11px]
              min-[480px]:text-xs
              sm:text-xs
              md:text-xs
              lg:text-[11px]
              xl:text-xs
              macbook:text-[13px]
              2xl:text-sm
              font-inter
              text-[#6E6E6E]
              block
              font-normal
              leading-tight
              truncate
            ">
              Completion
            </span>

            <span className="
              text-base
  
  font-inter
  font-bold
  leading-tight
  text-black
  block
  truncate
            ">
              {seller.returnRate || seller.onTimeDelivery || "100%"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
