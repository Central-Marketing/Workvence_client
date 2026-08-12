import React from 'react';
import { Skeleton, CardSkeleton } from './Skeleton';

export const CategoryCarouselSkeleton: React.FC = () => {
  return (
    <div className="w-full py-12 bg-white">
      <div className="container mx-auto px-4 md:px-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="w-48 h-8" />
          <div className="flex gap-2">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col bg-slate-50 rounded-2xl p-2 gap-3 border border-slate-100">
              <Skeleton className="w-full h-44 rounded-xl" />
              <Skeleton className="w-3/4 h-4 mx-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TopSellersSkeleton: React.FC = () => {
  return (
    <div className="w-full py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="w-64 h-9" />
            <Skeleton className="w-96 h-4" />
          </div>
          <Skeleton className="w-28 h-10 rounded-lg hidden md:block" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
