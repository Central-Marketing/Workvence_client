import React from 'react';
import { Skeleton } from './Skeleton';

export const BriefsListSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-5">
      {/* Search & Tabs Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Skeleton className="w-20 h-9 rounded-[6px]" />
          <Skeleton className="w-24 h-9 rounded-[6px]" />
          <Skeleton className="w-28 h-9 rounded-[6px]" />
        </div>
        <Skeleton className="w-full sm:w-64 h-10 rounded-[6px]" />
      </div>

      {/* Brief Card Rows */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[6px] border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="w-3/4 max-w-md h-5 rounded" />
                <Skeleton className="w-full max-w-lg h-3.5 rounded" />
              </div>
              <Skeleton className="w-24 h-7 rounded-full shrink-0" />
            </div>

            {/* Skills & Metadata Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Skeleton className="w-16 h-6 rounded-[6px]" />
                <Skeleton className="w-20 h-6 rounded-[6px]" />
                <Skeleton className="w-16 h-6 rounded-[6px]" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-28 h-4 rounded" />
                <Skeleton className="w-24 h-8 rounded-[6px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
