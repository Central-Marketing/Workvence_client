import React from 'react';
import { Skeleton } from './Skeleton';

export const PackageDetailSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6 space-y-8">
        {/* Breadcrumb & Title */}
        <div className="space-y-4">
          <Skeleton className="w-64 h-4" />
          <Skeleton className="w-3/4 h-8" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
        </div>

        {/* Hero Gallery & Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Gallery */}
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-full aspect-[16/9] rounded-xl" />
              ))}
            </div>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <Skeleton className="w-full h-12 rounded-xl" />
              <div className="flex justify-between items-center">
                <Skeleton className="w-24 h-6" />
                <Skeleton className="w-20 h-8" />
              </div>
              <Skeleton className="w-full h-16 rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
