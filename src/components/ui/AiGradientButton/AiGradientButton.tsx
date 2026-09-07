"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export interface AiGradientButtonProps {
  children?: ReactNode;
  text?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showIcon?: boolean;
  icon?: ReactNode;
  iconSize?: number;
  iconPosition?: "left" | "right";
  px?: string; // e.g. "px-6", "px-4", "px-[24px]"
  py?: string; // e.g. "py-3", "py-2", "py-[12px]"
  width?: string;
  height?: string;
}

export const AiGradientButton: React.FC<AiGradientButtonProps> = ({
  children,
  text,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  style,
  showIcon = true,
  icon,
  iconSize = 18,
  iconPosition = "right",
  px = "px-[24px]",
  py = "py-[12px]",
  width,
  height,
}) => {
  const content = text !== undefined ? text : children;

  const defaultIcon = (
    <Sparkles
      size={iconSize}
      className="text-[#112131] stroke-[2] shrink-0 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 ease-out"
    />
  );

  const iconElement = icon !== undefined ? (
    <span className="shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ease-out">
      {icon}
    </span>
  ) : (
    defaultIcon
  );

  const combinedStyles: React.CSSProperties = {
    background: "linear-gradient(90deg, #9AFFDA 0%, #82C2FD 100%)",
    ...style,
  };

  const combinedClasses = `group relative overflow-hidden inline-flex items-center justify-center gap-[10px] rounded-[10px] text-[#112131] font-sf-pro font-medium text-[15px] border border-white/40 shadow-xs hover:shadow-lg hover:shadow-[#82C2FD]/30 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82C2FD]/60 focus-visible:ring-offset-2 ${px} ${py} ${width || ""} ${height || ""} ${className}`.trim();

  const innerContent = (
    <>
      {/* Fiverr/Upwork AI Style Shimmer Light Sweep */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-[10px]">
        {showIcon && iconPosition === "left" && iconElement}
        {content && <span>{content}</span>}
        {showIcon && iconPosition === "right" && iconElement}
      </span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        style={combinedStyles}
        onClick={onClick}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      style={combinedStyles}
    >
      {innerContent}
    </button>
  );
};

export const GradientButton = AiGradientButton;
export default AiGradientButton;
