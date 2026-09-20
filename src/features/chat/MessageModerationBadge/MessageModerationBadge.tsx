"use client";

import React, { useState } from 'react';
import { RiAlertFill } from 'react-icons/ri';
import { MessageModeration } from '@/types';
import { Button } from '@/components/ui';
import { getModerationConfig, getModerationNoticeContent } from '@/utils/moderationConfig';

interface MessageModerationBadgeProps {
  moderation?: MessageModeration | null;
  isOwner?: boolean;
}

export const MessageModerationBadge: React.FC<MessageModerationBadgeProps> = ({
  moderation,
  isOwner = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = getModerationConfig(moderation);
  const notice = getModerationNoticeContent(moderation);

  if (!config || !moderation?.flagged) return null;

  return (
    <div className="relative inline-block my-0.5">
      {/* Moderation Badge / Trigger */}
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
        aria-label={config.badgeLabel}
        icon={<RiAlertFill className={`w-4 h-4 ${config.iconColor}`} />}
      />

      {/* Friendly Marketplace Tooltip */}
      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute bottom-full mb-2 z-50 w-64 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-slate-800 dark:text-slate-100 text-xs transition-all pointer-events-auto ${isOwner ? 'right-0' : 'left-0'
            }`}
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <RiAlertFill className={`w-4 h-4 ${config.iconColor} flex-shrink-0`} />
            <span className="text-[13px]">{notice.title}</span>
          </div>

          {/* User-friendly message */}
          <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed mb-2.5">
            {notice.message}
          </p>

          {/* Platform protection guidance */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {notice.guidance}
          </p>

          {/* Tooltip triangle arrow */}
          <div
            className={`absolute top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white dark:border-t-slate-900 ${isOwner ? 'right-4' : 'left-4'
              }`}
          />
        </div>
      )}
    </div>
  );
};

export default MessageModerationBadge;
