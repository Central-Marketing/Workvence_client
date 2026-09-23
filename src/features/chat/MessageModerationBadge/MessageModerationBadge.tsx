"use client";

import React, { useState } from 'react';
import { RiAlertFill } from 'react-icons/ri';
import { MessageModeration } from '@/types';
import { Button } from '@/components/ui';
import { getModerationConfig, getModerationNoticeContent, getStandardTooltipText } from '@/utils/moderationConfig';

interface MessageModerationBadgeProps {
  moderation?: MessageModeration | null;
  isOwner?: boolean;
  className?: string;
  useFlagIcon?: boolean;
}

export const MessageModerationBadge: React.FC<MessageModerationBadgeProps> = ({
  moderation,
  isOwner = false,
  className = '',
  useFlagIcon = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = getModerationConfig(moderation);
  const notice = getModerationNoticeContent(moderation);
  const tooltipText = getStandardTooltipText(moderation);

  if (!config || !moderation?.flagged) return null;

  return (
    <div className={`relative inline-block self-end mb-1 shrink-0 select-none ${className}`}>
      {/* Moderation Badge / Trigger */}
      {useFlagIcon ? (
        <button
          type="button"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="cursor-pointer focus:outline-none flex items-center justify-center p-0.5 rounded transition-transform hover:scale-105 active:scale-95"
          title={tooltipText}
          aria-label={tooltipText}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.0249 21C5.04385 19.2643 5.04366 17.5541 5.0366 15.9209M5.0366 15.9209C5.01301 10.4614 4.91276 5.86186 5.19475 4.04271C5.5611 1.67939 9.39301 3.82993 13.9703 5.59842L16.0328 6.48729C17.5508 7.1415 19.7187 8.30352 18.7662 9.66084C18.3738 10.22 17.56 10.8596 16.0575 11.567L5.0366 15.9209Z"
              stroke="#DA0000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          radius="md"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className={`w-7 h-7 min-h-[28px] !p-0 ${config.badgeText} hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1`}
          aria-label={tooltipText || config.badgeLabel}
          title={tooltipText}
          icon={<RiAlertFill className={`w-4 h-4 ${config.iconColor}`} />}
        />
      )}

      {/* Friendly Marketplace Tooltip Card */}
      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute bottom-full mb-2 z-50 w-72 max-w-[calc(100vw-32px)] p-3.5 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-slate-800 dark:text-slate-100 text-xs transition-all pointer-events-auto ${
            isOwner ? 'right-0' : 'left-0 sm:left-auto sm:right-0 md:left-0'
          }`}
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#DA0000]">
              <path
                d="M5.0249 21C5.04385 19.2643 5.04366 17.5541 5.0366 15.9209M5.0366 15.9209C5.01301 10.4614 4.91276 5.86186 5.19475 4.04271C5.5611 1.67939 9.39301 3.82993 13.9703 5.59842L16.0328 6.48729C17.5508 7.1415 19.7187 8.30352 18.7662 9.66084C18.3738 10.22 17.56 10.8596 16.0575 11.567L5.0366 15.9209Z"
                stroke="#DA0000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[13px] font-semibold">{notice.title}</span>
          </div>

          {/* User-friendly message */}
          <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed mb-2">
            {notice.message}
          </p>

          {/* Platform protection guidance */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {notice.guidance}
          </p>

          {/* Tooltip triangle arrow */}
          <div
            className={`absolute top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white dark:border-t-slate-900 ${
              isOwner ? 'right-3' : 'left-3'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default MessageModerationBadge;
