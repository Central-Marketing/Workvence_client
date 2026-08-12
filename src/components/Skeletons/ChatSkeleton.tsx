import React from 'react';
import { Skeleton } from './Skeleton';

export const ChatSkeleton: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden pt-16">
      {/* LEFT: Conversation List Skeleton */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-50">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-10 h-3" />
                </div>
                <Skeleton className="w-36 h-3" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER: Chat Window Skeleton */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>

        {/* Chat Messages Thread */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50/50">
          <div className="flex gap-3 max-w-md">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="w-64 h-16 rounded-2xl rounded-tl-none" />
          </div>
          <div className="flex gap-3 max-w-md ml-auto flex-row-reverse">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="w-72 h-20 rounded-2xl rounded-tr-none" />
          </div>
          <div className="flex gap-3 max-w-md">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="w-48 h-12 rounded-2xl rounded-tl-none" />
          </div>
        </div>

        {/* Compose Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      </main>

      {/* RIGHT: About Contact Skeleton */}
      <aside className="w-72 border-l border-slate-200 bg-white p-5 hidden lg:flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-5">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-24 h-4" />
        </div>
        <div className="space-y-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      </aside>
    </div>
  );
};
