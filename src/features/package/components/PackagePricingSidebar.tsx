"use client";

import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiClock, FiRepeat, FiCheckSquare, FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { PackageTierDetails, SellerDetails, FALLBACK_IMAGES } from "../utils/packageDetailsNormalizer";

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
  onViewSellerProfile?: () => void;
}

export const PackagePricingSidebar: React.FC<PackagePricingSidebarProps> = ({
  packages,
  seller,
  selectedTier,
  onSelectTier,
  onContact,
  onViewSellerProfile,
}) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const activePkg = packages[selectedTier] || packages.basic;

  const checklistItems = [
    activePkg.features.pageCount,
    activePkg.features.customAsset,
    activePkg.features.responsive ? "Responsive design" : null,
    activePkg.features.wireframes ? "Wireframes" : null,
    activePkg.features.prototype ? "Prototype" : null,
    activePkg.features.sourceFile ? "Include source file" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Card: Packages Pricing Tier Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs">
        {/* Tier Segmented Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#F4F4F6] p-1.5 rounded-xl text-center mb-5">
          {(['basic', 'standard', 'premium'] as const).map((tierKey) => {
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

        {/* Tagline */}
        <span className="text-xs text-gray-500 font-medium block mb-1">
          {activePkg.tagline}
        </span>

        {/* Price Display */}
        <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-gray-100">
          <span className="text-3xl font-bold text-gray-900">${activePkg.price}</span>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed mb-5 pb-5 border-b border-gray-100">
          {activePkg.shortDesc}
        </p>

        {/* Revisions & Delivery Meta Row */}
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 mb-5">
          <div className="flex items-center gap-1.5">
            <FiRepeat className="w-3.5 h-3.5 text-gray-500" />
            <span>{activePkg.revisions}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 text-gray-500" />
            <span>{activePkg.deliveryTime} Day Delivery</span>
          </div>
        </div>

        {/* Feature Checklist with rounded pill rows */}
        <div className="space-y-2 mb-6">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-50/70 border border-gray-100/80 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs text-gray-700 font-medium"
            >
              <FiCheckSquare className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Action Button: Contact Me */}
        <button
          type="button"
          onClick={onContact}
          className="w-full py-3.5 bg-[#EAECEF] hover:bg-[#DFE2E6] text-gray-800 text-xs sm:text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Contact me</span>
          <FiArrowRight className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>

      {/* 2. Bottom Card: About The Seller Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            About the seller
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">
            Member Since, {seller.memberSince}
          </span>
        </div>

        {/* Seller Info Row */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={seller.avatar || FALLBACK_IMAGES.sellerAvatar}
            alt={seller.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGES.sellerAvatar;
            }}
          />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-bold text-gray-900">{seller.name}</h4>
              {seller.isPro && (
                <span className="bg-[#6D28D9] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Pro
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{seller.role}</span>
              <div className="flex items-center gap-1 font-semibold text-gray-900">
                <span>{seller.rating.toFixed(1)}</span>
                <FaStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-gray-400 font-normal">({seller.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Bio with See more */}
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          {isBioExpanded ? seller.bio : `${seller.bio.slice(0, 115)}... `}
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

        {/* Country & Language */}
        <div className="space-y-1.5 text-xs text-gray-600 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">From</span>
            <span className="font-semibold text-gray-800">{seller.country}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Language</span>
            <span className="font-semibold text-gray-800">{seller.languages.join(", ")}</span>
          </div>
        </div>

        {/* Skills Pills */}
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

        {/* Analysis Seller Profile CTA Button */}
        <button
          type="button"
          onClick={onViewSellerProfile}
          className="w-full py-3 bg-[#67e8f9] hover:bg-[#22d3ee] text-teal-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-98"
        >
          <span>Analysis Seller Profile</span>
          <HiSparkles className="w-4 h-4 text-teal-900" />
        </button>
      </div>
    </div>
  );
};
