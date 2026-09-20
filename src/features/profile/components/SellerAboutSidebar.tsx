"use client";

import React from "react";
import { FiMapPin, FiClock, FiPackage, FiArrowRight } from "react-icons/fi";
import { AiGradientButton, Button } from "@/components/ui";

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
  memberSince,
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
            About this seller
          </h2>
          {memberSince && (
            <span className="text-xs font-medium font-sf-pro text-gray-600 bg-white/90 border border-gray-200/90 px-3 py-1 rounded-md shadow-2xs shrink-0">
              Member since <strong className="font-semibold text-gray-900">{memberSince}</strong>
            </span>
          )}
        </div>

        <hr className="my-2" />

        {/* Bio Paragraph */}
        <p className="text-[13.5px] sm:text-sm text-gray-600 leading-relaxed font-normal mb-6">
          {bio || "This seller hasn't added a bio yet."}
        </p>

        {/* 3 Metric / Stat Boxes */}
        <div className="bg-[#F8F8F8] border border-[#DADADA] rounded-[10px] overflow-hidden grid grid-cols-1 sm:grid-cols-3 mb-6">

          {/* Box 1: Location */}
          <div className="min-h-[64px] sm:min-h-[72px] macbook:min-h-[76px] px-3 py-3 sm:px-2.5 sm:py-3 macbook:px-3 macbook:py-3.5 flex items-center gap-2 sm:gap-2 macbook:gap-2.5 border-b sm:border-b-0 sm:border-r border-black/10 min-w-0">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 macbook:w-8 macbook:h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <FiMapPin className="w-3.5 h-3.5 macbook:w-4 macbook:h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] macbook:text-[11px] leading-[13px] macbook:leading-[14px] text-gray-400 block font-normal">
                From
              </span>

              <span
                className="text-xs macbook:text-[13px] leading-[16px] font-bold text-gray-900 truncate block"
                title={country || "—"}
              >
                {country || "—"}
              </span>
            </div>
          </div>

          {/* Box 2: Response Time */}
          <div className="min-h-[64px] sm:min-h-[72px] macbook:min-h-[76px] px-3 py-3 sm:px-2.5 sm:py-3 macbook:px-3 macbook:py-3.5 flex items-center gap-2 sm:gap-2 macbook:gap-2.5 border-b sm:border-b-0 sm:border-r border-black/10 min-w-0">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 macbook:w-8 macbook:h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <FiClock className="w-3.5 h-3.5 macbook:w-4 macbook:h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] macbook:text-[11px] leading-[13px] macbook:leading-[14px] text-gray-400 block font-normal">
                Response Time
              </span>

              <span
                className="text-xs macbook:text-[13px] leading-[16px] font-bold text-gray-900 truncate block"
                title={responseTime || "—"}
              >
                {responseTime || "—"}
              </span>
            </div>
          </div>

          {/* Box 3: On Time Delivery */}
          <div className="min-h-[64px] sm:min-h-[72px] macbook:min-h-[76px] px-3 py-3 sm:px-2.5 sm:py-3 macbook:px-3 macbook:py-3.5 flex items-center gap-2 sm:gap-2 macbook:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 macbook:w-8 macbook:h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <FiPackage className="w-3.5 h-3.5 macbook:w-4 macbook:h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] macbook:text-[11px] leading-[13px] macbook:leading-[14px] text-gray-400 block font-normal">
                On Time Delivery
              </span>

              <span
                className="text-xs macbook:text-[13px] leading-[16px] font-bold text-gray-900 truncate block"
                title={onTimeDelivery || "—"}
              >
                {onTimeDelivery || "—"}
              </span>
            </div>
          </div>

        </div>

        {/* Skills Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold font-sf-pro text-gray-900 mb-2.5">
            Skills:
          </h3>
          {skills && skills.length > 0 ? (
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
          ) : (
            <p className="text-xs text-gray-400 italic">No skills listed yet.</p>
          )}
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
          <Button
            type="button"
            variant="dark"
            size="md"
            radius="fiverr"
            fullWidth
            onClick={onContact}
            rightIcon={<FiArrowRight className="w-4 h-4" />}
            className="font-semibold shadow-xs mb-3"
          >
            Contact with {name.split(" ")[0]}
          </Button>

          {/* Secondary Action Row: Message + Analysis Seller Profile */}
          {/* <div className="grid grid-cols-2 gap-2.5">
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
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5 aspect-square shrink-0"
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SellerAboutSidebar;
