"use client";

import React from "react";
import { CheckCircle2, Bell, Clock } from "lucide-react";

interface FirstMessageMilestoneProps {
  isAwaitingFirstReply: boolean;
  finalRecipientUser?: any;
}

export const FirstMessageMilestone: React.FC<FirstMessageMilestoneProps> = ({
  isAwaitingFirstReply,
  finalRecipientUser,
}) => {
  if (!isAwaitingFirstReply) return null;

  return (
    <div className="mx-auto my-5 max-w-md w-full bg-white border border-[#0D6D5F]/20 rounded-[8px] p-5 shadow-xs text-center transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-10 h-10 rounded-[6px] bg-[#ffffff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] flex items-center justify-center mx-auto mb-3 shadow-2xs">
        <CheckCircle2 className="w-5 h-5 text-[#0D6D5F]" />
      </div>
      <h3 className="font-bold text-sm sm:text-base text-slate-900 font-sf-pro">
        Message sent successfully
      </h3>
      <p className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-relaxed max-w-sm mx-auto">
        The seller has received your message. You’ll be notified when they reply.
      </p>
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-[#0D6D5F]" />
          In-app alerts
        </span>
        <span className="text-slate-300">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {finalRecipientUser?.responseTimeHours
            ? `Avg. reply: ${finalRecipientUser.responseTimeHours}h`
            : finalRecipientUser?.responseTime || "Quick response"}
        </span>
      </div>
    </div>
  );
};
