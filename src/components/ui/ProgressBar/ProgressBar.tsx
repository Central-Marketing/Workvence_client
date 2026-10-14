import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  indicatorClassName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = "",
  indicatorClassName = "",
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-[10px] w-full bg-[#EDEDED] border border-[rgba(0,0,0,0.10)] rounded-full overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#03FA28] to-[#00E0DD] ${indicatorClassName}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
