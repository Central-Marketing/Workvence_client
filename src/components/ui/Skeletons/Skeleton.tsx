import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-300 rounded-lg ${className}`}
      style={style}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col h-full">
      <div className="relative w-full">
        <Skeleton className="w-full aspect-[16/9] rounded-xl" />
        <div className="absolute -bottom-4 left-3 sm:left-3.5">
          <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white" />
        </div>
      </div>
      <div className="flex flex-col flex-1 pt-6 sm:pt-7">
        <div className="flex items-center justify-between">
          <Skeleton className="w-28 h-5 rounded" />
          <Skeleton className="w-16 h-4 rounded" />
        </div>
        <Skeleton className="w-full h-4 mt-3 rounded" />
        <Skeleton className="w-3/4 h-4 mt-2 rounded" />
        <div className="flex items-baseline gap-2 mt-auto pt-6">
          <Skeleton className="w-20 h-4 rounded" />
          <Skeleton className="w-14 h-5 rounded" />
        </div>
      </div>
    </div>
  );
};
