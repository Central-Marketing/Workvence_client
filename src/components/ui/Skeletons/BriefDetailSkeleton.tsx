import React from 'react';
import { Skeleton } from './Skeleton';

export const BriefDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pt-6 sm:pt-8 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-5">
          <Skeleton className="w-14 h-3.5 rounded" />
          <span className="text-slate-300 text-xs">/</span>
          <Skeleton className="w-28 h-3.5 rounded" />
        </div>

        {/* Title & Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0 space-y-2.5">
            <Skeleton className="w-3/4 max-w-xl h-8 sm:h-9 rounded-[6px]" />
            <Skeleton className="w-full max-w-2xl h-4 rounded-[6px]" />
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start">
            <Skeleton className="w-24 h-7 rounded-full" />
            <Skeleton className="w-28 h-7 rounded-full" />
          </div>
        </div>

        {/* Action Link & Posted Time Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-20 h-3 rounded" />
        </div>

        <hr className="border-slate-200/70 my-6" />

        {/* Overview Skeleton */}
        <div className="mb-8 space-y-3">
          <Skeleton className="w-24 h-5 rounded" />
          <div className="space-y-2 max-w-5xl">
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-4/5 h-4 rounded" />
            <Skeleton className="w-3/5 h-4 rounded" />
          </div>
        </div>

        {/* 5-Column Specification Metric Card Skeleton */}
        <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-2xs p-4 sm:p-5 my-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3 first:pl-0">
              <Skeleton className="w-10 h-10 rounded-[6px] shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="w-14 h-3 rounded" />
                <Skeleton className="w-20 h-4 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Mandatory Skills Skeleton */}
        <div className="mb-6 space-y-3">
          <Skeleton className="w-32 h-5 rounded" />
          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton className="w-24 h-7 rounded-[6px]" />
            <Skeleton className="w-28 h-7 rounded-[6px]" />
            <Skeleton className="w-20 h-7 rounded-[6px]" />
            <Skeleton className="w-32 h-7 rounded-[6px]" />
            <Skeleton className="w-16 h-7 rounded-[6px]" />
          </div>
        </div>

        <hr className="mb-6 border-slate-200/70" />

        {/* Proposal Activity Skeleton */}
        <div className="mb-10 space-y-3">
          <Skeleton className="w-36 h-5 rounded" />
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              <Skeleton className="w-8 h-8 rounded-full border-2 border-white" />
              <Skeleton className="w-8 h-8 rounded-full border-2 border-white" />
              <Skeleton className="w-8 h-8 rounded-full border-2 border-white" />
            </div>
            <div className="space-y-1">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-36 h-3 rounded" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="w-32 h-9 rounded-[6px]" />
          </div>
        </div>

        {/* Bottom Banner Skeleton */}
        <div className="w-full rounded-[6px] overflow-hidden mt-12 mb-6 h-[260px] sm:h-[300px]">
          <Skeleton className="w-full h-full rounded-[6px]" />
        </div>
      </div>
    </div>
  );
};
