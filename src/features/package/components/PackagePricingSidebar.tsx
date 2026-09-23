"use client";

import React from "react";
import { FiClock, FiRepeat, FiArrowRight, FiMessageSquare } from "react-icons/fi";
import { PackageTierDetails, SellerDetails } from "../utils/packageDetailsNormalizer";
import { Button } from "@/components/ui";
import { getOnlineStatus } from "@/utils";

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
  onViewSellerProfile: _onViewSellerProfile,
  className = "",
}) => {

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

  const sellerStatus = getOnlineStatus(seller.lastActiveAt || seller.lastSeen, seller.isOnline, 10);

  return (
    <div className={`w-full max-w-[400px] space-y-6 ${className}`.trim()}>
      {/* 1. Top Card: Packages Pricing Tier Card */}
      <div className="bg-[#FFF] border border-[rgba(0,0,0,0.10)] rounded-[6px] p-[20px] shadow-2xs">
        {/* Tier Segmented Tabs (only if multiple tiers exist) */}
        {availableTiers.length > 1 && (
          <div
            className="grid gap-1 bg-[#F4F4F6] p-[4px] rounded-[6px] border border-gray-200/50 text-center mb-5  items-center"
            style={{
              gridTemplateColumns: `repeat(${availableTiers.length}, minmax(0, 1fr))`,
            }}
          >
            {availableTiers.map((tierKey) => {
              const pkg = packages[tierKey];
              const isSelected = selectedTier === tierKey;

              return (
                <Button
                  key={tierKey}
                  type="button"
                  variant={isSelected ? "brand" : "ghost"}
                  size="sm"
                  radius="fiverr"
                  onClick={() => onSelectTier(tierKey)}
                  className={`flex-1 h-full font-inter font-medium text-[14px] sm:text-[15px] transition-all cursor-pointer ${isSelected
                    ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                    : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
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
          <h4 className="font-inter font-[510] not-italic text-[12px] text-[var(--Foundation-Grey-grey-400,#6E6E6E)] leading-normal mb-1">
            {activePkg.tagline || activePkg.title}
          </h4>
        )}

        {/* Price Display */}
        <div className="flex items-baseline mb-4 pb-4 border-b border-gray-100 font-inter font-semibold text-[26px] min-[400px]:text-[28px] sm:text-[20px] md:text-[22px] lg:text-[24px] xl:text-[26px]  not-italic">
          <span className="text-[000]">$</span>
          <span className="text-[#000]">{activePkg.price}</span>
        </div>

        {/* Short Description */}
        {activePkg.shortDesc && (
          <p className="
            font-inter
            not-italic
            text-[14px]
            leading-[1.3]
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
          <div className="flex items-center gap-4 sm:gap-5 2xl:gap-6 font-sf-pro font-normal not-italic text-[13px]  text-[var(--Foundation-Grey-grey-500,#4A4A4A)] leading-normal mb-5 flex-wrap">
            {activePkg.revisions ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FiRepeat className="w-[15px] h-[15px]  text-[var(--Foundation-Grey-grey-500,#4A4A4A)] shrink-0" />
                <span>{activePkg.revisions}</span>
              </div>
            ) : null}
            {activePkg.deliveryTime > 0 ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FiClock className="w-[15px] h-[15px] text-[var(--Foundation-Grey-grey-500,#4A4A4A)] shrink-0" />
                <span>{activePkg.deliveryTime} Day{activePkg.deliveryTime > 1 ? 's' : ''} Delivery</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Feature Checklist with rounded pill rows (only if features exist) */}
        {checklistItems.length > 0 && (
          <div className="mb-6 bg-[#F5F5F5] rounded-[6px] border border-[rgba(0,0,0,0.10)] overflow-hidden divide-y divide-[rgba(0,0,0,0.10)]">
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
                <span className="not-italic text-[13px] font-inter text-[#6E6E6E] leading-normal">
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

      {/* Floating Message Seller Pill (matches Fiverr/marketplace floating widget) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onContact}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onContact();
          }
        }}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 sm:gap-3 bg-white hover:bg-[#FAFAFA] border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.10)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-[6px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 select-none animate-fadeIn"
        title={`Message ${seller.name || seller.username || "Seller"}`}
      >
        {/* Emerald Lightning Bolt */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#10B981"
          className="w-3.5 h-4 sm:w-4 sm:h-4 text-[#10B981] fill-[#10B981] shrink-0"
          aria-hidden="true"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>

        {/* Circular Avatar with Online/Offline Status Dot */}
        <div className="relative shrink-0">
          <img
            src={seller.avatar || defaultAvatar}
            alt={seller.name || "Seller"}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200/80 shadow-2xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultAvatar;
            }}
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white ${
              sellerStatus.isOnline ? "bg-[#10B981]" : "bg-slate-300"
            }`}
          />
        </div>

        {/* Text Stack */}
        <div className="flex flex-col text-left justify-center pr-1 sm:pr-2">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs sm:text-[13.5px] leading-tight">
            {/* Speech Bubble Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 shrink-0"
              aria-hidden="true"
            >
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
            </svg>
            <span>Message {seller.name || seller.username || "Seller"}</span>
          </div>
          <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-normal leading-tight mt-0.5">
            {sellerStatus.isOnline ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                Online
              </span>
            ) : sellerStatus.lastSeenText ? (
              `Offline · Last seen ${sellerStatus.lastSeenText}`
            ) : (
              "Offline"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
