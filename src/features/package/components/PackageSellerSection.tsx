"use client";

import React from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FiMapPin, FiClock, FiPackage } from "react-icons/fi";
import { Button } from "@/components/ui";
import { SellerDetails } from "../utils/packageDetailsNormalizer";

interface PackageSellerSectionProps {
  seller: SellerDetails;
  onContact: () => void;
}

export const PackageSellerSection: React.FC<PackageSellerSectionProps> = ({
  seller,
  onContact,
}) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    seller.name || "Seller"
  )}&background=0D9488&color=fff&bold=true`;

  return (
    <div id="section-seller" className="scroll-mt-36 bg-[#F5F5F5] border border-gray-100 rounded-[6px] p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 ">
          About the Seller
        </h2>
        {seller.memberSince && (
          <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-[6px]">
            Member since {seller.memberSince}
          </span>
        )}
      </div>

      {/* Seller Header Row */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/seller/${seller.username || seller.name}`}
          className="shrink-0 group block"
          title={`View ${seller.name}'s profile`}
        >
          <img
            src={seller.avatar || defaultAvatar}
            alt={seller.name}
            className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-xs group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultAvatar;
            }}
          />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Link
              href={`/seller/${seller.username || seller.name}`}
              className="text-base font-bold text-gray-900 hover:text-brand-green transition-colors"
              title={`View ${seller.name}'s profile`}
            >
              <h3 className="text-base font-bold text-gray-900 hover:text-brand-green transition-colors">
                {seller.name}
              </h3>
            </Link>
            {seller.isPro && (
              <span className="bg-[#6D28D9] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                Pro
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <span>{seller.role}</span>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <span>{seller.rating > 0 ? seller.rating.toFixed(1) : "New"}</span>
              <FaStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-gray-400 font-normal">({seller.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Paragraph */}
      {seller.bio && (
        <p className="text-[14.5px] text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
          {seller.bio}
        </p>
      )}

      {/* Stat Boxes Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 bg-gray-50/70 border border-gray-100 rounded-[6px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-[#FAFAFA] border border-[rgba(0, 0, 0, 0.10)] text-[#F00000] flex items-center justify-center shrink-0">
            <FiMapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium font-inter">From</span>
            <span className="text-sm font-semibold font-inter text-gray-900">{seller.country || "—"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200/60 pt-2.5 sm:pt-0 sm:pl-3">
          <div className="w-8 h-8 rounded-[6px] bg-[#FAFAFA] border border-[rgba(0, 0, 0, 0.10)] text-[#F57727] flex items-center justify-center shrink-0">
            <FiClock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium font-inter">Response Time</span>
            <span className="text-sm font-semibold font-inter text-gray-900">{seller.responseTime || "—"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200/60 pt-2.5 sm:pt-0 sm:pl-3">
          <div className="w-8 h-8 rounded-[6px] bg-[#FAFAFA] border border-[rgba(0, 0, 0, 0.10)] text-[#54AA54] flex items-center justify-center shrink-0">
            <FiPackage className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium font-inter">Order Delivery</span>
            <span className="text-sm font-semibold font-inter text-gray-900">{seller.onTimeDelivery || "—"}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={onContact}
          variant="dark"
          size="md"
          radius="fiverr"
        >
          Contact Seller
        </Button>
        <Button
          href={`/seller/${seller.username || seller.name}`}
          variant="outline"
          size="md"
          radius="fiverr"
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};
