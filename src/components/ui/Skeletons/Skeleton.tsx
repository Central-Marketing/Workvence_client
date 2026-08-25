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
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 p-4 shadow-xs flex flex-col gap-3">
      <Skeleton className="w-full h-48 rounded-xl" />
      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="w-full h-4 mt-1" />
      <Skeleton className="w-3/4 h-4" />
      <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-20 h-5" />
      </div>
    </div>
  );
};
