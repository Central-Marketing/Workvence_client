"use client";

import React from "react";
import { FiMapPin, FiClock, FiPackage, FiArrowRight } from "react-icons/fi";
import { AiGradientButton, Button } from "@/components/ui";
import { getOnlineStatus } from "@/utils/userStatus";

interface SellerAboutSidebarProps {
  name: string;
  memberSince?: string;
  bio: string;
  country: string;
  responseTime: string;
  onTimeDelivery: string;
  skills: string[];
  localTimeText?: string;
  lastActiveAt?: string | Date | null;
  isOnline?: boolean;
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
  lastActiveAt,
  isOnline,
  onContact,
  onMessage,
  onAnalyzeProfile,
}) => {
  const userStatus = getOnlineStatus(lastActiveAt, isOnline, 10);
  const statusLabel = userStatus.isOnline
    ? "Online"
    : userStatus.lastSeenText
      ? `Active ${userStatus.lastSeenText}`
      : "Offline";

  const cleanLocalTime = (localTimeText || "")
    .replace(/^(Online|Offline|Active[^•]*)\s*•\s*/i, "")
    .trim();
  return (
    <div className="w-full space-y-6">
      {/* 1. Main "About this seler" Card */}
      <div className="bg-[#F5F5F5] border border-gray-200/80 rounded-[6px] p-6 shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold font-sf-pro text-gray-900 tracking-tight">
            About this seller
          </h2>
          {memberSince && (
            <span className="text-xs font-medium font-sf-pro text-gray-600 bg-white/90 border border-gray-200/90 px-3 py-1 rounded-[6px] shadow-2xs shrink-0">
              Member since <strong className="font-semibold text-gray-900">{memberSince}</strong>
            </span>
          )}
        </div>

        <hr className="my-2" />

        {/* Bio Paragraph */}
        <p className="text-[13px] font-inter text-[#4A4A4A] leading-relaxed font-normal mb-6">
          {bio || "This seller hasn't added a bio yet."}
        </p>

        {/* 3 Metric / Stat Boxes */}
        <div className="bg-[#F8F8F8] border border-[#DADADA] rounded-[6px] overflow-hidden grid grid-cols-1 2xl:grid-cols-3 mb-6">

          {/* Box 1: Location */}
          <div className="min-h-[64px] sm:min-h-[72px] px-3.5 py-3 sm:px-4 sm:py-3.5 2xl:px-2.5 2xl:py-3 flex items-center gap-2.5 2xl:gap-2 border-b 2xl:border-b-0 2xl:border-r border-black/10 min-w-0">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 2xl:w-8 2xl:h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <FiMapPin className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] leading-[13px] sm:leading-[14px] text-gray-400 block font-normal">
                From
              </span>

              <span
                className="text-xs sm:text-[13px] leading-[16px] font-bold text-gray-900 truncate block"
                title={country || "—"}
              >
                {country || "—"}
              </span>
            </div>
          </div>

          {/* Box 2: Response Time */}
          <div className="min-h-[64px] sm:min-h-[72px] px-3.5 py-3 sm:px-4 sm:py-3.5 2xl:px-2.5 2xl:py-3 flex items-center gap-2.5 2xl:gap-2 border-b 2xl:border-b-0 2xl:border-r border-black/10 min-w-0">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 2xl:w-8 2xl:h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <FiClock className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] leading-[13px] sm:leading-[14px] text-gray-400 block font-normal">
                Response Time
              </span>

              <span
                className="text-xs sm:text-[13px] leading-[16px] font-bold text-gray-900 truncate block"
                title={responseTime || "—"}
              >
                {responseTime || "—"}
              </span>
            </div>
          </div>

          {/* Box 3: On Time Delivery */}
          <div className="min-h-[64px] sm:min-h-[72px] px-3.5 py-3 sm:px-4 sm:py-3.5 2xl:px-2.5 2xl:py-3 flex items-center gap-2.5 2xl:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 2xl:w-8 2xl:h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <FiPackage className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] leading-[13px] sm:leading-[14px] text-gray-400 block font-normal">
                On Time Delivery
              </span>

              <span
                className="text-xs sm:text-[13px] leading-[16px] font-bold text-gray-900 truncate block"
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
                  className="text-xs text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-[6px] shadow-2xs font-normal"
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
        <div className="bg-white border border-gray-200/80 rounded-[6px] p-5 shadow-xs">
          <div className="mb-4">
            <h4 className="text-base font-bold font-sf-pro text-gray-900">
              {name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full inline-block shrink-0 ${
                  userStatus.isOnline
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-gray-400"
                }`}
              />
              <span>
                {statusLabel}
                {cleanLocalTime ? ` • ${cleanLocalTime}` : ""}
              </span>
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


        </div>
      </div>
    </div>
  );
};

export default SellerAboutSidebar;
