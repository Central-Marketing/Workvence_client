import React from 'react';
import { Skeleton, CardSkeleton } from './Skeleton';

export const SellerProfileSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN Skeleton */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="w-36 h-6" />
              <Skeleton className="w-24 h-4" />
            </div>
            <div className="space-y-4">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-11 rounded-xl" />
            </div>
          </div>

          {/* RIGHT COLUMN Skeleton */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 space-y-4">
              <Skeleton className="w-48 h-7" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
            </div>
            <div className="space-y-4">
              <Skeleton className="w-48 h-7" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
