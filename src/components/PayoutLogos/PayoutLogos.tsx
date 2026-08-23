import React from "react";

export const StripeLogo: React.FC<{ className?: string; size?: number }> = ({
  className = "h-5 w-auto",
}) => (
  <svg
    viewBox="0 0 60 25"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M59.64 14.28c0-4.44-2.18-7.94-6.42-7.94-4.26 0-6.84 3.5-6.84 7.9 0 5.22 3.08 7.88 7.42 7.88 2.12 0 3.72-.48 4.92-1.16v-3.3c-1.2.62-2.54.98-4.14.98-1.68 0-3.14-.6-3.34-2.54h8.34c0-.36.06-1.32.06-1.82zm-8.4-1.5c0-1.84 1.1-2.6 2.04-2.6.9 0 1.94.76 1.94 2.6h-3.98zm-9.06-6.44c-1.42 0-2.4.68-2.92 1.18l-.2-1h-4.32v20.44l4.78-1.02.02-4.9c.54.46 1.42 1.06 2.7 1.06 2.74 0 5.26-2.18 5.26-7.86-.02-5.18-2.58-7.9-5.32-7.9zm-1.02 12.04c-.9 0-1.46-.34-1.86-.76l-.04-6.52c.44-.48 1.04-.8 1.9-.8 1.48 0 2.48 1.44 2.48 4.02 0 2.64-.98 4.06-2.48 4.06zm-12.8-13.62l-4.74 1.02v3.74h-2.38v3.86h2.38v7.54c0 3.12 1.56 4.64 4.4 4.64 1.18 0 2.06-.2 2.62-.48v-3.56c-.46.18-3.08.98-3.08-1.48v-6.66h3.4v-3.86h-3.4l.8-4.76zm-8.76 4.92c-.96-.44-2.36-.78-3.66-.78-2.44 0-3.98 1.28-3.98 3.42 0 4.14 5.68 3.5 5.68 5.3 0 .74-.66 1.04-1.56 1.04-1.38 0-3.12-.58-4.24-1.22v3.86c1.28.56 2.78.84 4.18.84 2.56 0 4.28-1.26 4.28-3.48 0-4.44-5.74-3.66-5.74-5.38 0-.6.54-.94 1.38-.94 1.18 0 2.58.44 3.66.94v-3.6zm-18.06-3.86h-4.78v15.66h4.78V5.84zm0-5.84h-4.78v4.12h4.78V0z"
    />
  </svg>
);

export const StripeIcon: React.FC<{ className?: string }> = ({
  className = "w-6 h-6",
}) => (
  <div className={`rounded-lg bg-[#635bff] flex items-center justify-center p-1 text-white shrink-0 ${className}`}>
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.839 3.908 6.643 7.848 8.043 2.532.902 3.396 1.547 3.396 2.571 0 .97-.864 1.547-2.316 1.547-2.096 0-5.074-1.077-7.145-2.225l-.946 5.568C6.398 23.633 9.497 24 12.637 24c2.617 0 4.79-.672 6.307-1.916 1.621-1.325 2.455-3.237 2.455-5.597 0-4.995-3.882-6.53-7.423-7.337z" />
    </svg>
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
