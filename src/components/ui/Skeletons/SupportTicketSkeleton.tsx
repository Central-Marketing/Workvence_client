import React from 'react';
import { Skeleton } from './Skeleton';

export const SupportTicketSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 md:pt-12 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-6 sm:space-y-7">
        {/* Page Header Skeleton */}
        <div className="bg-white p-6 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-16 h-4 rounded" />
            <span className="text-slate-300">/</span>
            <Skeleton className="w-24 h-4 rounded" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="w-64 sm:w-80 h-7 rounded-[6px]" />
                <Skeleton className="w-16 h-5 rounded-full" />
                <Skeleton className="w-24 h-5 rounded-full" />
              </div>
              <Skeleton className="w-48 h-4 rounded" />
            </div>

            <div className="flex items-center gap-2.5">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-[6px]" />
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Ticket Details & Context Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-4 self-start">
            {/* 1. Linked Order Card Skeleton */}
            <div className="bg-white p-5 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-16 h-4 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-36 h-4 rounded" />
                <Skeleton className="w-full h-3.5 rounded" />
              </div>
              <Skeleton className="w-full h-8 rounded-[6px] mt-2" />
            </div>

            {/* 2. Ticket Info Card Skeleton */}
            <div className="bg-white p-5 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-3">
              <Skeleton className="w-28 h-4 rounded pb-1" />
              <div className="space-y-2.5 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <Skeleton className="w-16 h-3 rounded" />
                    <Skeleton className="w-24 h-3.5 rounded" />
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Skeleton className="w-20 h-3 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="w-20 h-6 rounded-full" />
                  <Skeleton className="w-24 h-6 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Conversation Stream Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-[6px] border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col min-h-[500px]">
            {/* Chat Header Skeleton */}
            <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-4 h-4 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="w-44 h-4 rounded" />
                  <Skeleton className="w-60 h-3 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-24 h-7 rounded-[4px]" />
                <Skeleton className="w-32 h-7 rounded-[4px]" />
              </div>
            </div>

            {/* Message Thread Skeleton */}
            <div className="flex-1 p-6 space-y-5 bg-[#f8fafc]/50">
              {/* Message 1 (Left - Participant) */}
              <div className="flex gap-3 items-end max-w-[75%]">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-20 h-3 rounded" />
                  <div className="p-4 rounded-[10px_10px_10px_0] bg-white border border-slate-200/80 shadow-2xs space-y-2">
                    <Skeleton className="w-full h-3.5 rounded" />
                    <Skeleton className="w-4/5 h-3.5 rounded" />
                    <Skeleton className="w-16 h-2.5 rounded mt-1" />
                  </div>
                </div>
              </div>

              {/* Message 2 (Right - You) */}
              <div className="flex gap-3 items-end max-w-[75%] ml-auto flex-row-reverse">
                <div className="space-y-1.5 flex-1 items-end flex flex-col">
                  <Skeleton className="w-16 h-3 rounded" />
                  <div className="p-4 rounded-[10px_10px_0_10px] bg-slate-100 border border-slate-200 shadow-2xs space-y-2 w-full">
                    <Skeleton className="w-full h-3.5 rounded" />
                    <Skeleton className="w-2/3 h-3.5 rounded" />
                    <Skeleton className="w-16 h-2.5 rounded mt-1 ml-auto" />
                  </div>
                </div>
              </div>

              {/* Message 3 (Left - Support Agent) */}
              <div className="flex gap-3 items-end max-w-[75%]">
                <Skeleton className="w-8 h-8 rounded-full shrink-0 !bg-[#0D6D5F]/20" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-24 h-3 rounded" />
                  <div className="p-4 rounded-[10px_10px_10px_0] bg-white border border-slate-200/80 shadow-2xs space-y-2">
                    <Skeleton className="w-5/6 h-3.5 rounded" />
                    <Skeleton className="w-16 h-2.5 rounded mt-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Form Footer Skeleton */}
            <div className="p-4 md:p-6 border-t border-[#e2e8f0] bg-white space-y-3">
              <Skeleton className="w-full h-20 rounded-[6px]" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="w-32 h-8 rounded-[6px]" />
                <Skeleton className="w-28 h-8 rounded-[6px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SupportTicketsListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-[6px] border border-[#e2e8f0] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-20 h-5 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-3/4 h-5 rounded" />
            <Skeleton className="w-full h-3.5 rounded" />
            <Skeleton className="w-2/3 h-3.5 rounded" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="w-28 h-4 rounded" />
            <Skeleton className="w-16 h-4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
