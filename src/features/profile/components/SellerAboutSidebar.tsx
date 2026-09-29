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
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 2xl:w-8 2xl:h-8 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] p-1 text-red-500 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13.6177 21.367C13.1841 21.773 12.6044 22 12.0011 22C11.3978 22 10.8182 21.773 10.3845 21.367C6.41302 17.626 1.09076 13.4469 3.68627 7.37966C5.08963 4.09916 8.45834 2 12.0011 2C15.5439 2 18.9126 4.09916 20.316 7.37966C22.9082 13.4393 17.599 17.6389 13.6177 21.367Z" stroke="#F00000" stroke-width="1.5" />
                <path d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z" stroke="#F00000" stroke-width="1.5" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px]  text-[#6E6E6E] block font-normal font-inter">
                From
              </span>

              <span
                className="text-xs sm:text-[13px] md:text-[13px] 2xl:text-[16px] font-sf-pro font-bold text-[#000]  block"
                title={country || "—"}
              >
                {country || "—"}
              </span>
            </div>
          </div>

          {/* Box 2: Response Time */}
          <div className="min-h-[64px] sm:min-h-[72px] px-3.5 py-3 sm:px-4 sm:py-3.5 2xl:px-2.5 2xl:py-3 flex items-center gap-2.5 2xl:gap-2 border-b 2xl:border-b-0 2xl:border-r border-black/10 min-w-0">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 2xl:w-8 2xl:h-8 rounded-[6px] p-1 bg-white border border-[rgba(0,0,0,0.10)] text-amber-500 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#F57727" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 6V12H16" stroke="#F57727" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px]  text-[#6E6E6E] block font-normal font-inter">
                Response Time
              </span>

              <span
                className="text-xs sm:text-[13px] md:text-[13px] 2xl:text-[16px] font-sf-pro font-bold text-[#000]  block"
                title={responseTime || "—"}
              >
                {responseTime || "—"}
              </span>
            </div>
          </div>

          {/* Box 3: On Time Delivery */}
          <div className="min-h-[64px] sm:min-h-[72px] px-3.5 py-3 sm:px-4 sm:py-3.5 2xl:px-2.5 2xl:py-3 flex items-center gap-2.5 2xl:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 2xl:w-8 2xl:h-8 rounded-[6px] p-1 bg-white border border-[rgba(0,0,0,0.10)] text-emerald-500 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 22C12.1818 22 11.4002 21.6588 9.83691 20.9764C8.01233 20.18 6.61554 19.5703 5.64648 19H2M13 22C13.8182 22 14.5998 21.6588 16.1631 20.9764C20.0544 19.2779 22 18.4286 22 17V6.5M13 22V11M4 6.5V9.5" stroke="#54AA54" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9.32592 9.69138L6.40472 8.27785C4.80157 7.5021 4 7.11423 4 6.5C4 5.88577 4.80157 5.4979 6.40472 4.72215L9.32592 3.30862C11.1288 2.43621 12.0303 2 13 2C13.9697 2 14.8712 2.4362 16.6741 3.30862L19.5953 4.72215C21.1984 5.4979 22 5.88577 22 6.5C22 7.11423 21.1984 7.5021 19.5953 8.27785L16.6741 9.69138C14.8712 10.5638 13.9697 11 13 11C12.0303 11 11.1288 10.5638 9.32592 9.69138Z" stroke="#54AA54" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M18.1366 4.01562L7.86719 8.98485" stroke="#54AA54" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 13H5" stroke="#54AA54" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 16H5" stroke="#54AA54" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px]  text-[#6E6E6E] block font-normal font-inter">
                On Time Delivery
              </span>

              <span
                className="text-xs sm:text-[13px] md:text-[13px] 2xl:text-[16px] font-sf-pro font-bold text-[#000]  block"
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
                className={`w-2 h-2 rounded-full inline-block shrink-0 ${userStatus.isOnline
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
