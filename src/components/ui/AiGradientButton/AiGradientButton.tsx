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
      className="text-[#112131] stroke-[2] shrink-0"
    />
  );

  const iconElement = icon !== undefined ? icon : defaultIcon;

  const combinedStyles: React.CSSProperties = {
    background: "linear-gradient(90deg, #9AFFDA 0%, #82C2FD 100%)",
    ...style,
  };

  const combinedClasses = `inline-flex items-center justify-center gap-[10px] rounded-[10px] text-[#112131] font-sf-pro font-medium text-[15px] hover:opacity-95 hover:shadow-md hover:shadow-[#9AFFDA]/30 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${px} ${py} ${width || ""} ${height || ""} ${className}`.trim();

  const innerContent = (
    <>
      {showIcon && iconPosition === "left" && iconElement}
      {content && <span>{content}</span>}
      {showIcon && iconPosition === "right" && iconElement}
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
