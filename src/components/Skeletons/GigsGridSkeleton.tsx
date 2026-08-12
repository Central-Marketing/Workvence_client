import React from 'react';
import { CardSkeleton } from './Skeleton';

interface GigsGridSkeletonProps {
  count?: number;
}

export const GigsGridSkeleton: React.FC<GigsGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
};
