import React from 'react';

export interface LoaderProps {
  size?: number | string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size, className }) => {
  return (
    <img width={size} height={size} src='/media/loader.svg' alt='loader' className={className} />
  );
};

export default Loader;
