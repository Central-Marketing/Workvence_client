"use client";

import React from "react";
import { FiMapPin, FiClock, FiPackage, FiArrowRight } from "react-icons/fi";
import { AiGradientButton } from "@/components/ui";

interface SellerAboutSidebarProps {
  name: string;
  memberSince?: string;
  bio: string;
  country: string;
  responseTime: string;
  onTimeDelivery: string;
  skills: string[];
  localTimeText: string;
  onContact?: () => void;
  onMessage?: () => void;
  onAnalyzeProfile?: () => void;
}

export const SellerAboutSidebar: React.FC<SellerAboutSidebarProps> = ({
  name,
  memberSince = "2009",
  bio,
  country,
  responseTime,
  onTimeDelivery,
  skills,
  localTimeText,
  onContact,
  onMessage,
  onAnalyzeProfile,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* 1. Main "About this seler" Card */}
      <div className="bg-[#F5F5F5] border border-gray-200/80 rounded-2xl p-6 shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold font-sf-pro text-gray-900 tracking-tight">
            About this seler
          </h2>
          <span className="text-xs font-medium font-sf-pro text-gray-600 bg-white/90 border border-gray-200/90 px-3 py-1 rounded-md shadow-2xs shrink-0">
            Member since <strong className="font-semibold text-gray-900">{memberSince}</strong>
          </span>
        </div>

        <hr className="my-2" />

        {/* Bio Paragraph */}
        <p className="text-[13.5px] sm:text-sm text-gray-600 leading-relaxed font-normal mb-6">
          {bio}
        </p>

        {/* 3 Metric / Stat Boxes */}
        <div className="bg-[#F8F8F8] border border-[#DADADA] rounded-[10px] overflow-hidden flex mb-6">

          {/* Box 1: Location */}
          <div className="flex-1 p-2 flex items-center gap-4 border-r border-black/10">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <FiMapPin className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <span className="text-[11px] leading-[14px] text-gray-400 block font-normal">
                From
              </span>

              <span className="text-xs leading-[16px] font-bold text-gray-900 truncate block">
                {country}
              </span>
            </div>
          </div>

          {/* Box 2: Response Time */}
          <div className="flex-1 h-[76px] p-4 flex items-center gap-4 border-r border-black/10">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <FiClock className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <span className="text-[11px] text-nowrap text-gray-400 block font-normal">
                Response Time
              </span>

              <span className="text-xs leading-[16px] font-bold text-gray-900 truncate block">
                {responseTime}
              </span>
            </div>
          </div>

          {/* Box 3: On Time Delivery */}
          <div className="flex-1 h-[76px] p-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <FiPackage className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <span className="text-[11px] text-nowrap text-gray-400 block font-normal">
                On Time Delivery
              </span>

              <span className="text-xs leading-[16px] font-bold text-gray-900 truncate block">
                {onTimeDelivery}
              </span>
            </div>
          </div>

        </div>

        {/* Skills Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold font-sf-pro text-gray-900 mb-2.5">
            Skills:
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs font-normal"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Section Header */}
        <h3 className="text-sm font-bold font-sf-pro text-gray-900 mb-2.5">
          Contact
        </h3>

        {/* Contact Card */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs">
          <div className="mb-4">
            <h4 className="text-base font-bold font-sf-pro text-gray-900">
              {name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>{localTimeText}</span>
            </div>
          </div>

          {/* Black Primary Action Button */}
          <button
            type="button"
            onClick={onContact}
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] mb-3"
          >
            <span>Contact with {name.split(" ")[0]}</span>
            <FiArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Action Row: Message + Analysis Seller Profile */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onMessage || onContact}
              className="w-full py-2.5 bg-[#EEEEEE] hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-[10px] flex items-center justify-center transition-colors cursor-pointer active:scale-[0.98]"
            >
              Message
            </button>

            <AiGradientButton
              onClick={onAnalyzeProfile}
              px="px-3"
              py="py-2.5"
              className="w-full text-xs font-bold"
              text="Analysis Seller Profile"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAboutSidebar;
