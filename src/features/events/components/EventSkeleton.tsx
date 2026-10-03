import React from "react";

export const EventCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-[8px] border border-gray-200/80 overflow-hidden shadow-2xs animate-pulse">
      {/* Thumbnail Aspect Ratio 16/9 */}
      <div className="w-full aspect-[16/9] bg-gray-100 relative" />

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Category & Status Chips */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-100 rounded-[4px]" />
            <div className="h-4 w-14 bg-gray-100 rounded-[4px]" />
          </div>

          {/* Title */}
          <div className="h-5 w-3/4 bg-gray-200 rounded-[4px]" />
          <div className="h-4 w-full bg-gray-100 rounded-[4px]" />

          {/* Date & Time */}
          <div className="h-3.5 w-1/2 bg-gray-100 rounded-[4px] mt-2" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="h-3.5 w-20 bg-gray-100 rounded-[4px]" />
          <div className="h-7 w-24 bg-gray-200 rounded-[6px]" />
        </div>
      </div>
    </div>
  );
};

export const EventGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const EventDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Banner Skeleton */}
      <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-100" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="h-4 w-24 bg-gray-200 rounded-[4px]" />
            <div className="h-8 w-3/4 bg-gray-200 rounded-[6px]" />
            <div className="h-4 w-full bg-gray-100 rounded-[4px]" />
            <div className="h-4 w-5/6 bg-gray-100 rounded-[4px]" />

            <div className="pt-8 space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded-[4px]" />
              <div className="h-4 w-full bg-gray-100 rounded-[4px]" />
              <div className="h-4 w-full bg-gray-100 rounded-[4px]" />
              <div className="h-4 w-2/3 bg-gray-100 rounded-[4px]" />
            </div>
          </div>

          {/* Action Card Sidebar Skeleton */}
          <div className="lg:col-span-4">
            <div className="rounded-[8px] border border-gray-200/80 p-6 space-y-4">
              <div className="h-5 w-1/2 bg-gray-200 rounded-[4px]" />
              <div className="h-10 w-full bg-gray-200 rounded-[6px]" />
              <div className="h-4 w-full bg-gray-100 rounded-[4px]" />
              <div className="h-4 w-3/4 bg-gray-100 rounded-[4px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
