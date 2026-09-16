"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FiClock, FiRepeat, FiCheckSquare, FiArrowRight, FiMessageSquare } from "react-icons/fi";
import { PackageTierDetails, SellerDetails } from "../utils/packageDetailsNormalizer";
import { AiGradientButton } from "@/components/ui";

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
}

export const PackagePricingSidebar: React.FC<PackagePricingSidebarProps> = ({
  packages,
  seller,
  selectedTier,
  onSelectTier,
  onContact,
  onCheckout,
  onViewSellerProfile,
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
    <div className="w-full space-y-6">
      {/* 1. Top Card: Packages Pricing Tier Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs">
        {/* Tier Segmented Tabs (only if multiple tiers exist) */}
        {availableTiers.length > 1 && (
          <div
            className="grid gap-1 bg-[#F4F4F6] p-1.5 rounded-xl text-center mb-5"
            style={{ gridTemplateColumns: `repeat(${availableTiers.length}, minmax(0, 1fr))` }}
          >
            {availableTiers.map((tierKey) => {
              const pkg = packages[tierKey];
              const isSelected = selectedTier === tierKey;
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => onSelectTier(tierKey)}
                  className={`py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0F3B39] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {pkg.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Tier Title (only if provided and not generic) */}
        {activePkg.title &&
          !["basic", "basic package", "standard", "standard package", "premium", "premium package"].includes(
            activePkg.title.toLowerCase().trim()
          ) && (
            <h4 className="text-sm font-semibold text-gray-800 mb-1">
              {activePkg.title}
            </h4>
          )}

        {/* Price Display */}
        <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-gray-100">
          <span className="text-3xl font-bold text-gray-900">${activePkg.price}</span>
        </div>

        {/* Short Description */}
        {activePkg.shortDesc && (
          <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed mb-5 pb-5 border-b border-gray-100">
            {activePkg.shortDesc}
          </p>
        )}

        {/* Revisions & Delivery Meta Row */}
        {(Boolean(activePkg.revisions) || activePkg.deliveryTime > 0) && (
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 mb-5">
            {activePkg.revisions ? (
              <div className="flex items-center gap-1.5">
                <FiRepeat className="w-3.5 h-3.5 text-gray-500" />
                <span>{activePkg.revisions}</span>
              </div>
            ) : null}
            {activePkg.deliveryTime > 0 ? (
              <div className="flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-gray-500" />
                <span>{activePkg.deliveryTime} Day{activePkg.deliveryTime > 1 ? 's' : ''} Delivery</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Feature Checklist with rounded pill rows (only if features exist) */}
        {checklistItems.length > 0 && (
          <div className="space-y-2 mb-6">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 border border-gray-100/80 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs text-gray-700 font-medium"
              >
                <FiCheckSquare className="w-4 h-4 text-brand-green shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Primary Action Button: Continue / Checkout */}
        {onCheckout && (
          <button
            type="button"
            onClick={() => onCheckout(activePkg.key)}
            className="w-full py-3.5 bg-brand-green hover:bg-brand-green/90 text-white text-xs sm:text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] mb-2.5"
          >
            <span>Continue (${activePkg.price})</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Secondary Action Button: Contact Me */}
        <button
          type="button"
          onClick={onContact}
          className="w-full py-3 bg-[#EAECEF] hover:bg-[#DFE2E6] text-gray-800 text-xs sm:text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <FiMessageSquare className="w-3.5 h-3.5 text-gray-600" />
          <span>Contact Seller</span>
        </button>
      </div>

      {/* 2. Bottom Card: About The Seller Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            About the seller
          </h3>
          {seller.memberSince && (
            <span className="text-[11px] text-gray-400 font-medium">
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
              className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Link
                href={`/seller/${seller.username || seller.name}`}
                className="text-sm font-bold text-gray-900 hover:text-brand-green transition-colors"
                title={`View ${seller.name}'s profile`}
              >
                <h4 className="text-sm font-bold text-gray-900 hover:text-brand-green transition-colors">
                  {seller.name}
                </h4>
              </Link>
              {seller.isPro && (
                <span className="bg-[#6D28D9] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Pro
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
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
          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            {isBioExpanded ? seller.bio : `${seller.bio.slice(0, 115)}${seller.bio.length > 115 ? '...' : ''} `}
            {seller.bio.length > 115 && (
              <button
                type="button"
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="font-bold text-gray-900 hover:underline inline ml-1 cursor-pointer"
              >
                {isBioExpanded ? "Show less" : "See more"}
              </button>
            )}
          </p>
        )}

        {/* Country & Language */}
        {(seller.country || seller.languages.length > 0) && (
          <div className="space-y-1.5 text-xs text-gray-600 mb-4 pb-4 border-b border-gray-100">
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
                className="text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-md"
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
            className="w-full py-3 text-xs sm:text-sm font-bold"
            text="View Seller Profile"
          />
        )}
      </div>
    </div>
  );
};
