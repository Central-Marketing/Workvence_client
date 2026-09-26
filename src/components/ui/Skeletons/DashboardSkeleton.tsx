import React from 'react';
import { Skeleton, CardSkeleton } from './Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-6 sm:pt-8 pb-16 font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-6">
        {/* Welcome Banner Skeleton */}
        <div className="bg-white border border-gray-100 rounded-[6px] p-6 sm:p-8 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="w-48 sm:w-64 h-7 rounded-[6px]" />
              <Skeleton className="w-64 sm:w-96 h-4 rounded-[6px]" />
            </div>
            <Skeleton className="w-32 h-9 rounded-[6px]" />
          </div>

          {/* Profile Completion Bar Skeleton */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="w-36 h-3.5 rounded" />
              <Skeleton className="w-12 h-3.5 rounded" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-[6px] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <Skeleton className="w-20 h-7 rounded-[6px]" />
              <Skeleton className="w-32 h-3 rounded" />
            </div>
          ))}
        </div>

        {/* Active Items Section Skeleton */}
        <div className="bg-white border border-gray-100 rounded-[6px] p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex justify-between items-center">
            <Skeleton className="w-40 h-6 rounded-[6px]" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
