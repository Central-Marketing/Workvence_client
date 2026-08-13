import React from 'react';
import { Skeleton } from './Skeleton';

export const OrderSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50/50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start gap-4 shadow-xs">
            <div className="space-y-3 flex-1 w-full">
              <Skeleton className="w-28 h-5 rounded-md !bg-slate-200" />
              <Skeleton className="w-3/4 h-8 rounded-lg !bg-slate-200" />
              <Skeleton className="w-1/2 h-4 rounded-md !bg-slate-200" />
            </div>
            <div className="space-y-2 shrink-0">
              <Skeleton className="w-24 h-4 rounded-md !bg-slate-200" />
              <Skeleton className="w-32 h-9 rounded-xl !bg-slate-200" />
            </div>
          </div>

          {/* Countdown Clock Banner Skeleton */}
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-5 flex items-center gap-4 shadow-xs">
            <Skeleton className="w-12 h-12 rounded-full shrink-0 !bg-emerald-200/70" />
            <div className="space-y-2 flex-1">
              <Skeleton className="w-36 h-4 rounded-md !bg-emerald-200/70" />
              <Skeleton className="w-48 h-6 rounded-md !bg-emerald-200/70" />
            </div>
          </div>

          {/* Order Activity Timeline Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <Skeleton className="w-48 h-6 rounded-md mb-4 !bg-slate-200" />
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-4">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0 !bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="w-40 h-5 rounded-md !bg-slate-200" />
                    <Skeleton className="w-full h-4 rounded-md !bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivered Work Card Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <Skeleton className="w-32 h-6 rounded-md !bg-slate-200" />
            <Skeleton className="w-full h-16 rounded-xl !bg-slate-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Skeleton className="w-full h-36 rounded-xl !bg-slate-200" />
              <Skeleton className="w-full h-36 rounded-xl !bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Sidebar Area (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <Skeleton className="w-36 h-6 rounded-md !bg-slate-200" />
            <div className="flex items-center gap-3 py-2 border-b border-slate-100">
              <Skeleton className="w-12 h-12 rounded-full shrink-0 !bg-slate-200" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="w-24 h-4 rounded-md !bg-slate-200" />
                <Skeleton className="w-16 h-3 rounded-md !bg-slate-200" />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <Skeleton className="w-20 h-4 !bg-slate-200" />
                <Skeleton className="w-24 h-4 !bg-slate-200" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-24 h-4 !bg-slate-200" />
                <Skeleton className="w-20 h-4 !bg-slate-200" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-28 h-4 !bg-slate-200" />
                <Skeleton className="w-16 h-4 !bg-slate-200" />
              </div>
            </div>
            <Skeleton className="w-full h-11 rounded-xl mt-4 !bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
