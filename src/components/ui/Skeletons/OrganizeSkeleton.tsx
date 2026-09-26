import React from 'react';
import { Skeleton } from './Skeleton';

export const OrganizeSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-7">
        {/* Step Navigation Tabs Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 shrink-0">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-20 h-4 rounded" />
            </div>
          ))}
        </div>

        {/* Main Form Card Skeleton */}
        <div className="bg-white rounded-[6px] border border-gray-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6 rounded" />
            <Skeleton className="w-72 h-4 rounded" />
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-full h-11 rounded-[6px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-full h-11 rounded-[6px]" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-full h-11 rounded-[6px]" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="w-28 h-4 rounded" />
              <Skeleton className="w-full h-32 rounded-[6px]" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <Skeleton className="w-24 h-10 rounded-[6px]" />
            <Skeleton className="w-28 h-10 rounded-[6px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
