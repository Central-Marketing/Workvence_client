import React from 'react';
import { Skeleton } from './Skeleton';

export const EarningsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 rounded-[6px]" />
            <Skeleton className="w-72 h-4 rounded-[6px]" />
          </div>
          <Skeleton className="w-36 h-10 rounded-[6px]" />
        </div>

        {/* 4 Financial Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[6px] border border-gray-200/90 p-5 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="w-28 h-4 rounded" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <Skeleton className="w-28 h-8 rounded-[6px]" />
              <Skeleton className="w-40 h-3 rounded" />
            </div>
          ))}
        </div>

        {/* Withdrawal Methods Card & Chart Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[6px] border border-gray-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="w-40 h-6 rounded" />
              <Skeleton className="w-24 h-4 rounded" />
            </div>
            <Skeleton className="w-full h-64 rounded-[6px]" />
          </div>

          <div className="bg-white rounded-[6px] border border-gray-200/90 p-6 shadow-2xs space-y-4">
            <Skeleton className="w-36 h-6 rounded" />
            <div className="space-y-3 pt-2">
              <Skeleton className="w-full h-16 rounded-[6px]" />
              <Skeleton className="w-full h-16 rounded-[6px]" />
            </div>
          </div>
        </div>

        {/* Statement Table Skeleton */}
        <div className="bg-white rounded-[6px] border border-gray-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="w-48 h-6 rounded" />
            <Skeleton className="w-32 h-8 rounded-[6px]" />
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-none">
                <div className="space-y-1.5">
                  <Skeleton className="w-40 h-4 rounded" />
                  <Skeleton className="w-24 h-3 rounded" />
                </div>
                <Skeleton className="w-20 h-5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
