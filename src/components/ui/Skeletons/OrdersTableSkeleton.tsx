import React from 'react';
import { Skeleton } from './Skeleton';

export const OrdersTableSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      {/* Top Filter & Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Skeleton className="w-20 h-9 rounded-[6px]" />
          <Skeleton className="w-24 h-9 rounded-[6px]" />
          <Skeleton className="w-28 h-9 rounded-[6px]" />
          <Skeleton className="w-24 h-9 rounded-[6px]" />
        </div>

        {/* Search Input */}
        <Skeleton className="w-full sm:w-64 h-10 rounded-[6px]" />
      </div>

      {/* Orders Table Container Skeleton */}
      <div className="bg-white rounded-[6px] border border-gray-200/90 overflow-hidden shadow-2xs">
        {/* Table Header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 grid grid-cols-12 gap-4 items-center">
          <Skeleton className="col-span-5 sm:col-span-4 h-4 rounded" />
          <Skeleton className="col-span-3 sm:col-span-2 h-4 rounded" />
          <Skeleton className="hidden sm:block sm:col-span-2 h-4 rounded" />
          <Skeleton className="col-span-2 sm:col-span-2 h-4 rounded" />
          <Skeleton className="col-span-2 sm:col-span-2 h-4 rounded" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-5 py-4 grid grid-cols-12 gap-4 items-center">
              {/* Order Name & Thumbnail */}
              <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                <Skeleton className="w-12 h-10 rounded-[6px] shrink-0" />
                <div className="min-w-0 space-y-1.5 flex-1">
                  <Skeleton className="w-3/4 h-4 rounded" />
                  <Skeleton className="w-1/2 h-3 rounded" />
                </div>
              </div>

              {/* Order Date */}
              <div className="col-span-3 sm:col-span-2">
                <Skeleton className="w-20 h-4 rounded" />
              </div>

              {/* Due Date */}
              <div className="hidden sm:block sm:col-span-2">
                <Skeleton className="w-20 h-4 rounded" />
              </div>

              {/* Total Price */}
              <div className="col-span-2 sm:col-span-2">
                <Skeleton className="w-16 h-4 rounded font-bold" />
              </div>

              {/* Status Badge */}
              <div className="col-span-2 sm:col-span-2">
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
