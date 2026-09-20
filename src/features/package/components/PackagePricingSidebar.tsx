"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FiClock, FiRepeat, FiArrowRight, FiMessageSquare } from "react-icons/fi";
import { PackageTierDetails, SellerDetails } from "../utils/packageDetailsNormalizer";
import { AiGradientButton, Button } from "@/components/ui";

interface PackagePricingSidebarProps {
  packages: {
    basic: PackageTierDetails;
    standard: PackageTierDetails;
    premium: PackageTierDetails;
  };
  seller: SellerDetails;
  selectedTier: 'basic' | 'standard' | 'premium';
  onSelectTier: (tier: 'basic' | 'standard' | 'premium') => void;
  onContact: () => void;
  onCheckout?: (tier?: 'basic' | 'standard' | 'premium') => void;
  onViewSellerProfile?: () => void;
  className?: string;
}

export const PackagePricingSidebar: React.FC<PackagePricingSidebarProps> = ({
  packages,
  seller,
  selectedTier,
  onSelectTier,
  onContact,
  onCheckout,
  onViewSellerProfile,
  className = "",
}) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const availableTiers = (['basic', 'standard', 'premium'] as const).filter(
    (key) => packages[key] && packages[key].hasTier !== false && packages[key].price > 0
  );

  const activePkg = packages[selectedTier] || packages.basic;

  const checklistItems =
    Array.isArray(activePkg.featureList) && activePkg.featureList.length > 0
      ? activePkg.featureList.filter(Boolean)
      : [];

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    seller.name || "Seller"
  )}&background=0D9488&color=fff&bold=true`;

  return (
    <div className={`w-full max-w-[500px] space-y-6 ${className}`.trim()}>
      {/* 1. Top Card: Packages Pricing Tier Card */}
      <div className="bg-[#FFF] border border-[rgba(0,0,0,0.10)] rounded-[20px] p-4 sm:p-5 2xl:p-[20px] shadow-2xs">
        {/* Tier Segmented Tabs (only if multiple tiers exist) */}
        {availableTiers.length > 1 && (
          <div
            className="grid gap-1 bg-[var(--Foundation-White-white-300,#F5F5F5)] p-1.5 sm:p-2 2xl:p-[10px] rounded-[10px] border border-[rgba(0,0,0,0.10)] text-center mb-5"
            style={{ gridTemplateColumns: `repeat(${availableTiers.length}, minmax(0, 1fr))` }}
          >
            {availableTiers.map((tierKey) => {
              const pkg = packages[tierKey];
              const isSelected = selectedTier === tierKey;
              return (
                <Button
                  key={tierKey}
                  type="button"
                  variant={isSelected ? "dark" : "ghost"}
                  size="xs"
                  radius="lg"
                  onClick={() => onSelectTier(tierKey)}
                  className={`py-2 sm:py-2.5 2xl:py-[10px] px-2 sm:px-3 lg:px-2.5 xl:px-3.5 2xl:px-[20px] rounded-[10px] font-inter font-normal not-italic text-[13px] min-[400px]:text-[14px] sm:text-[15px] md:text-[16px] lg:text-[16px] xl:text-[18px] macbook:text-[19px] 2xl:text-[20px] leading-[20px] sm:leading-[22px] lg:leading-[24px] 2xl:leading-[26px] transition-all cursor-pointer ${isSelected
                    ? "!bg-[var(--Foundation-Green-green-900,#0B403F)] !text-[var(--Foundation-White-white-50,#FFF)] shadow-xs"
                    : "!text-[var(--Foundation-Grey-grey-400,#6E6E6E)] hover:!text-gray-900"
                    }`}
                >
                  {pkg.name}
                </Button>
              );
            })}
          </div>
        )}

        {/* Custom Tier Title / Tagline */}
        {(activePkg.tagline || activePkg.title) && (
          <h4 className="font-sf-pro font-[510] not-italic text-[14px] min-[400px]:text-[15px] sm:text-[16px] md:text-[16px] lg:text-[17px] xl:text-[18px] macbook:text-[19px] 2xl:text-[20px] text-[var(--Foundation-Grey-grey-400,#6E6E6E)] leading-normal mb-1">
            {activePkg.tagline || activePkg.title}
          </h4>
        )}

        {/* Price Display */}
        <div className="flex items-baseline mb-4 pb-4 border-b border-gray-100 font-sf-pro font-bold text-[26px] min-[400px]:text-[28px] sm:text-[20px] md:text-[22px] lg:text-[24px] xl:text-[26px] macbook:text-[28px] 2xl:text-[36px] not-italic">
          <span className="text-[var(--Foundation-Grey-grey-400,#6E6E6E)]">$</span>
          <span className="text-[#000]">{activePkg.price}</span>
        </div>

        {/* Short Description */}
        {activePkg.shortDesc && (
          <p className="
            font-sf-pro
            font-normal
            not-italic
            text-[14px]
            min-[400px]:text-[15px]
            md:text-[14px]
            lg:text-[15px]
            xl:text-[16px]
            macbook:text-[18px]
            2xl:text-[24px]
            text-[var(--Foundation-Grey-grey-500,#4A4A4A)]
            mb-5
            pb-5
            border-b
            border-gray-100
          ">
            {activePkg.shortDesc}
          </p>
        )}

        {/* Revisions & Delivery Meta Row */}
        {(Boolean(activePkg.revisions) || activePkg.deliveryTime > 0) && (
          <div className="flex items-center gap-4 sm:gap-5 2xl:gap-6 font-sf-pro font-normal not-italic text-[13px] min-[400px]:text-[14px] sm:text-[15px] md:text-[16px] lg:text-[16px] xl:text-[18px] macbook:text-[19px] 2xl:text-[20px] text-[var(--Foundation-Grey-grey-500,#4A4A4A)] leading-normal mb-5 flex-wrap">
            {activePkg.revisions ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FiRepeat className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] lg:w-[20px] lg:h-[20px] xl:w-[22px] xl:h-[22px] macbook:w-[23px] macbook:h-[23px] 2xl:w-[24px] 2xl:h-[24px] text-[var(--Foundation-Grey-grey-500,#4A4A4A)] shrink-0" />
                <span>{activePkg.revisions}</span>
              </div>
            ) : null}
            {activePkg.deliveryTime > 0 ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FiClock className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] lg:w-[20px] lg:h-[20px] xl:w-[22px] xl:h-[22px] macbook:w-[23px] macbook:h-[23px] 2xl:w-[24px] 2xl:h-[24px] text-[var(--Foundation-Grey-grey-500,#4A4A4A)] shrink-0" />
                <span>{activePkg.deliveryTime} Day{activePkg.deliveryTime > 1 ? 's' : ''} Delivery</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Feature Checklist with rounded pill rows (only if features exist) */}
        {checklistItems.length > 0 && (
          <div className="mb-6 bg-[#F5F5F5] rounded-[20px] border border-[rgba(0,0,0,0.10)] overflow-hidden divide-y divide-[rgba(0,0,0,0.10)]">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className="px-3.5 sm:px-4 lg:px-[18px] 2xl:px-[20px] py-2.5 sm:py-3 lg:py-3.5 2xl:py-[20px] flex items-center gap-2.5 sm:gap-3"
              >
                <svg
                  className="w-4 h-4 min-[400px]:w-5 min-[400px]:h-5 sm:w-[22px] sm:h-[22px] 2xl:w-6 2xl:h-6 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
                    stroke="#656565"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 12.5L10.5 15L16 9"
                    stroke="#656565"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-sf-pro font-[510] not-italic text-[13px] min-[400px]:text-[14px] sm:text-[15px] md:text-[15px] lg:text-[15px] xl:text-[16px] macbook:text-[16px] 2xl:text-[17px] text-[#6E6E6E] leading-normal">
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Primary Action Button: Continue / Checkout */}
        {onCheckout && (
          <Button
            variant="brand"
            size="md"
            radius="fiverr"
            fullWidth
            onClick={() => onCheckout(activePkg.key)}
            rightIcon={<FiArrowRight className="w-4 h-4" />}
            className="mb-2.5 font-bold"
          >
            Continue (${activePkg.price})
          </Button>
        )}

        {/* Secondary Action Button: Contact Me */}
        <Button
          variant="soft"
          size="md"
          radius="fiverr"
          fullWidth
          onClick={onContact}
          leftIcon={<FiMessageSquare className="w-3.5 h-3.5 text-gray-600" />}
          className="font-semibold"
        >
          Contact Seller
        </Button>
      </div>

      {/* 2. Bottom Card: About The Seller Card */}
      <div className="bg-[#FFF] border border-[rgba(0,0,0,0.10)] rounded-[20px] p-4 sm:p-5 2xl:p-[20px] shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-xs min-[400px]:text-[13px] sm:text-sm md:text-sm lg:text-sm xl:text-[15px] 2xl:text-base font-bold text-gray-900">
            About the seller
          </h3>
          {seller.memberSince && (
            <span className="text-[10px] min-[400px]:text-[11px] sm:text-xs 2xl:text-xs text-gray-400 font-medium">
              Member Since, {seller.memberSince}
            </span>
          )}
        </div>

        {/* Seller Info Row */}
        <div className="flex items-center gap-3 mb-4">
          <Link
            href={`/seller/${seller.username || seller.name}`}
            className="shrink-0 group block"
            title={`View ${seller.name}'s profile`}
          >
            <img
              src={seller.avatar || defaultAvatar}
              alt={seller.name}
              className="w-10 h-10 min-[400px]:w-11 min-[400px]:h-11 sm:w-12 sm:h-12 2xl:w-[50px] 2xl:h-[50px] rounded-full object-cover border border-gray-200 shadow-2xs group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Link
                href={`/seller/${seller.username || seller.name}`}
                className="text-xs min-[400px]:text-[13px] sm:text-sm md:text-sm lg:text-sm xl:text-[15px] 2xl:text-base font-bold text-gray-900 hover:text-brand-green transition-colors"
                title={`View ${seller.name}'s profile`}
              >
                <h4 className="text-xs min-[400px]:text-[13px] sm:text-sm md:text-sm lg:text-sm xl:text-[15px] 2xl:text-base font-bold text-gray-900 hover:text-brand-green transition-colors">
                  {seller.name}
                </h4>
              </Link>
              {seller.isPro && (
                <span className="bg-[#6D28D9] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Pro
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] min-[400px]:text-xs 2xl:text-xs text-gray-500 flex-wrap">
              {seller.role ? <span>{seller.role}</span> : null}
              {seller.rating > 0 ? (
                <div className="flex items-center gap-1 font-semibold text-gray-900">
                  <span>{seller.rating.toFixed(1)}</span>
                  <FaStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-gray-400 font-normal">({seller.reviewCount})</span>
                </div>
              ) : (
                <span className="text-gray-400">New Seller</span>
              )}
            </div>
          </div>
        </div>

        {/* Seller Bio with See more */}
        {seller.bio && (
          <p className="text-[11px] min-[400px]:text-xs sm:text-[13px] md:text-[13px] lg:text-xs xl:text-[13px] 2xl:text-sm text-gray-600 leading-relaxed mb-4">
            {isBioExpanded ? seller.bio : `${seller.bio.slice(0, 115)}${seller.bio.length > 115 ? '...' : ''} `}
            {seller.bio.length > 115 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="font-bold text-gray-900 hover:underline inline ml-1 cursor-pointer !p-0 !min-h-0 !h-auto text-[11px] min-[400px]:text-xs sm:text-[13px] md:text-[13px] lg:text-xs xl:text-[13px] 2xl:text-sm"
              >
                {isBioExpanded ? "Show less" : "See more"}
              </Button>
            )}
          </p>
        )}

        {/* Country & Language */}
        {(seller.country || seller.languages.length > 0) && (
          <div className="space-y-1.5 text-[11px] min-[400px]:text-xs sm:text-[13px] lg:text-xs xl:text-[13px] 2xl:text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            {seller.country ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">From</span>
                <span className="font-semibold text-gray-800">{seller.country}</span>
              </div>
            ) : null}
            {seller.languages.length > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Language</span>
                <span className="font-semibold text-gray-800">{seller.languages.join(", ")}</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Skills Pills */}
        {seller.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {seller.skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-[10px] min-[400px]:text-[11px] sm:text-xs 2xl:text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Analysis Seller Profile CTA Button */}
        {onViewSellerProfile && (
          <AiGradientButton
            onClick={onViewSellerProfile}
            className="w-full py-2.5 sm:py-3 text-xs min-[400px]:text-[13px] sm:text-sm 2xl:text-sm font-bold"
            text="Seller Profile"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 aspect-square shrink-0"
              >
                <path
                  d="M19.5 3.9375V5.5M19.5 5.5V7.0625M19.5 5.5H18.25M19.5 5.5H20.75M22 5.5L20.9156 5.13852C20.4179 4.97263 20.0274 4.58211 19.8615 4.08443L19.5 3L19.1385 4.08443C18.9726 4.58211 18.5821 4.97263 18.0844 5.13852L17 5.5L18.0844 5.86148C18.5821 6.02737 18.9726 6.41789 19.1385 6.91557L19.5 8L19.8615 6.91557C20.0274 6.41789 20.4179 6.02737 20.9156 5.86148L22 5.5Z"
                  stroke="#292929"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12.8598C4.81875 10.0939 11.44 4.44198 13.275 6.40609C15.5938 8.888 3.40937 15.1646 5.28854 17.93C7.2734 20.851 14.2146 10.5543 16.5635 12.3982C18.9125 14.2422 10.926 18.391 12.8052 20.696C13.5569 21.6179 15.6239 20.235 16.5635 19.313"
                  stroke="#292929"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
};
