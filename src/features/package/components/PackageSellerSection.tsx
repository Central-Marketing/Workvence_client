"use client";

import React from "react";
import { FaStar } from "react-icons/fa";
import { FiMapPin, FiClock, FiPackage } from "react-icons/fi";
import { SellerDetails, FALLBACK_IMAGES } from "../utils/packageDetailsNormalizer";

interface PackageSellerSectionProps {
  seller: SellerDetails;
  onContact: () => void;
}

export const PackageSellerSection: React.FC<PackageSellerSectionProps> = ({
  seller,
  onContact,
}) => {
  return (
    <div id="section-seller" className="scroll-mt-36 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Meet your guy
        </h2>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
          Member since {seller.memberSince}
        </span>
      </div>

      {/* Seller Header Row */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={seller.avatar || FALLBACK_IMAGES.sellerAvatar}
          alt={seller.name}
          className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGES.sellerAvatar;
          }}
        />
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-bold text-gray-900">{seller.name}</h3>
            {seller.isPro && (
              <span className="bg-[#6D28D9] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                Pro
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{seller.role}</span>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <span>{seller.rating.toFixed(1)}</span>
              <FaStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-gray-400 font-normal">({seller.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Paragraph */}
      <p className="text-[14.5px] text-gray-600 leading-relaxed mb-6">
        {seller.bio}
      </p>

      {/* 3 Stat Boxes Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 bg-gray-50/70 border border-gray-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <FiMapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">From</span>
            <span className="text-sm font-bold text-gray-900">{seller.country}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200/60 pt-2.5 sm:pt-0 sm:pl-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FiClock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Response Time</span>
            <span className="text-sm font-bold text-gray-900">{seller.responseTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200/60 pt-2.5 sm:pt-0 sm:pl-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FiPackage className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">On Time Delivery</span>
            <span className="text-sm font-bold text-gray-900">{seller.onTimeDelivery}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onContact}
          className="px-6 py-2.5 bg-white border border-gray-300 hover:border-gray-900 text-gray-800 text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          Connect with Me
        </button>
        <button
          type="button"
          onClick={onContact}
          className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          Book a Consultation
        </button>
      </div>
    </div>
  );
};
