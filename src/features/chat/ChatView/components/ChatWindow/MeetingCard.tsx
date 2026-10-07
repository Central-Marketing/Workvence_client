"use client";

import React from "react";
import { Button } from "@/components";

interface MeetingCardProps {
  meeting: any;
  finalRecipientUser?: any;
  partnerUsername?: string;
  onCopyText: (text: string, msg?: string) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  finalRecipientUser,
  partnerUsername,
  onCopyText,
}) => {
  return (
    <div
      className="w-[410px] max-w-full p-5 flex flex-col justify-center items-start gap-5 shadow-sm custom-gradient-card"
      style={{
        borderRadius: "20px",
        border: "3px solid transparent",
        background:
          "linear-gradient(#FFF, #FFF) padding-box, linear-gradient(135deg, #00A6FF 0%, #3ED419 50%, #F29EFF 100%) border-box",
        WebkitBackgroundClip: "padding-box, border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {/* Top Header: Video Camera Icon + Title + Copy Link */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 18.9749 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z"
              stroke="#354B9A"
              strokeWidth="1.5"
            />
            <path
              d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941"
              stroke="#354B9A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z"
              stroke="#354B9A"
              strokeWidth="1.5"
            />
          </svg>
          <span className="text-[16px] font-bold text-slate-900 leading-none">
            Video Meeting Invitation
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          radius="md"
          onClick={() =>
            onCopyText(
              meeting.roomUrl || meeting.joinUrl || `Meeting ID: ${meeting.meetingId || ""}`,
              "Meeting link copied to clipboard!"
            )
          }
          className="text-slate-700 hover:text-black p-1 hover:bg-slate-100"
          title="Copy meeting link"
          aria-label="Copy meeting link"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="8" y="8" width="13" height="13" rx="3" />
              <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
            </svg>
          }
        />
      </div>

      <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

      {/* Credentials Row: ID & Passcode pills */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 bg-[#F0F0F0] rounded-[6px] px-3.5 py-2.5 flex items-center justify-between gap-2 min-w-0">
          <span className="text-sm font-medium text-slate-700 truncate">
            ID- {meeting.meetingId || (meeting.roomUrl ? String(meeting.roomUrl).split("/").pop() : "81346682237")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="md"
            onClick={() =>
              onCopyText(
                meeting.meetingId ||
                  (meeting.roomUrl ? String(meeting.roomUrl).split("/").pop() : ""),
                "Meeting ID copied!"
              )
            }
            className="text-slate-600 hover:text-black shrink-0 !p-0.5 !min-h-0 !h-auto w-auto"
            title="Copy Meeting ID"
            aria-label="Copy Meeting ID"
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="8" y="8" width="13" height="13" rx="3" />
                <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
              </svg>
            }
          />
        </div>

        <div className="flex-1 bg-[#F0F0F0] rounded-[6px] px-3.5 py-2.5 flex items-center justify-between gap-2 min-w-0">
          <span className="text-sm font-medium text-slate-700 truncate">
            Pass- {meeting.password || meeting.passcode || "i4Rs8N"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="md"
            onClick={() =>
              onCopyText(meeting.password || meeting.passcode || "", "Passcode copied!")
            }
            className="text-slate-600 hover:text-black shrink-0 !p-0.5 !min-h-0 !h-auto w-auto"
            title="Copy Passcode"
            aria-label="Copy Passcode"
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="8" y="8" width="13" height="13" rx="3" />
                <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
              </svg>
            }
          />
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#EBEBEB] -my-1" />

      {/* Title & Description */}
      <div className="w-full flex flex-col gap-2">
        <h5 className="text-[16px] font-bold text-slate-900 leading-snug m-0">
          {meeting.title ||
            `Job Discussion with @${
              finalRecipientUser?.username || partnerUsername || "Nilson_dev"
            }`}
        </h5>
        <p className="text-[14px] text-slate-600 leading-relaxed m-0 font-normal">
          {meeting.description ||
            "Join the real-time video consultation room to discuss projectrequirement, scope and deliverable"}
        </p>
      </div>

      {/* Action Button: Join Meeting */}
      <div className="w-full pt-1">
        <a
          href={meeting.roomUrl || meeting.joinUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-10 rounded-[6px] font-semibold text-[16px] bg-[#000000] text-white hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
        >
          <span>Join Meeting</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>
  );
};
