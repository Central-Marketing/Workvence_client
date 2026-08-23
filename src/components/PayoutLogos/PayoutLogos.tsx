import React from "react";
import { FaStripe } from "react-icons/fa";

export const StripeLogo: React.FC<{ className?: string; size?: number }> = ({
  className = "h-6 w-auto",
  size,
}) => (
  <FaStripe size={size} className={`text-[#635bff] ${className}`} />
);

export const StripeIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "w-6 h-6",
  size,
}) => (
  <div className={`rounded-lg bg-[#635bff] flex items-center justify-center p-1 text-white shrink-0 ${className}`}>
    <FaStripe size={size} className="w-full h-full text-white" />
  </div>
);

export const PayoneerLogo: React.FC<{ className?: string }> = ({
  className = "h-5 w-auto",
}) => (
  <div className={`flex items-center gap-1.5 font-sans ${className}`}>
    {/* Payoneer signature rainbow halo ring */}
    <svg
      viewBox="0 0 32 32"
      className="w-5 h-5 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="payoneerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4800" />
          <stop offset="35%" stopColor="#FF1879" />
          <stop offset="70%" stopColor="#8F00FF" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="11"
        fill="none"
        stroke="url(#payoneerGradient)"
        strokeWidth="6"
      />
    </svg>
    <span className="font-extrabold tracking-tight text-slate-900 text-sm">
      payoneer
    </span>
  </div>
);

export const PayoneerIcon: React.FC<{ className?: string }> = ({
  className = "w-6 h-6",
}) => (
  <div className={`flex items-center justify-center shrink-0 ${className}`}>
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="payoneerIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4800" />
          <stop offset="35%" stopColor="#FF1879" />
          <stop offset="70%" stopColor="#8F00FF" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="11"
        fill="none"
        stroke="url(#payoneerIconGrad)"
        strokeWidth="6"
      />
    </svg>
  </div>
);
