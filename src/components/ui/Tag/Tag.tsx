"use client";

import React, { forwardRef, ReactNode, HTMLAttributes } from "react";

export type TagVariant =
  | "in_progress"
  | "In_progress"
  | "inprogress"
  | "Inprogress"
  | "in-progress"
  | "in_revision"
  | "In_revision"
  | "in_Revision"
  | "revision"
  | "Revision"
  | "in-revision"
  | "completed"
  | "Completed"
  | "delivered"
  | "Delivered"
  | "cancelled"
  | "Cancelled"
  | "failed"
  | "Failed"
  | "pending"
  | "Pending"
  | "draft"
  | "Draft"
  | "late"
  | "Late"
  | "danger"
  | "Danger"
  | "delivered_late"
  | "Delivered_late"
  | "delivered-late"
  | "disputed"
  | "Disputed"
  | "neutral"
  | "Neutral"
  | string;

export type TagSize = "sm" | "md" | "lg";

export interface TagProps extends HTMLAttributes<HTMLElement> {
  variant?: TagVariant;
  size?: TagSize;
  dot?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  as?: "span" | "div" | "button";
}

interface VariantDefinition {
  color: string;
  background: string;
  defaultLabel: string;
  dotColor: string;
}

const VARIANT_CONFIGS: Record<string, VariantDefinition> = {
  in_revision: {
    color: "var(--purple-700, #4600A9)",
    background: "var(--purple-50, #EFE6FD)",
    defaultLabel: "Revision",
    dotColor: "#4600A9",
  },
  revision: {
    color: "var(--purple-700, #4600A9)",
    background: "var(--purple-50, #EFE6FD)",
    defaultLabel: "Revision",
    dotColor: "#4600A9",
  },
  in_progress: {
    color: "var(--blue-600, #021B75)",
    background: "var(--blue-50, #E6E9F2)",
    defaultLabel: "Inprogress",
    dotColor: "#021B75",
  },
  inprogress: {
    color: "var(--blue-600, #021B75)",
    background: "var(--blue-50, #E6E9F2)",
    defaultLabel: "Inprogress",
    dotColor: "#021B75",
  },
  delivered: {
    color: "var(--teal-900, #265F58)",
    background: "var(--teal-100, #CCF6F1)",
    defaultLabel: "Delivered",
    dotColor: "#265F58",
  },
  pending: {
    color: "var(--alert-900, #674C00)",
    background: "#FFFFFF",
    defaultLabel: "Pending",
    dotColor: "#674C00",
  },
  completed: {
    color: "var(--teal-900, #265F58)",
    background: "var(--teal-100, #CCF6F1)",
    defaultLabel: "Completed",
    dotColor: "#265F58",
  },
  cancelled: {
    color: "#991B1B",
    background: "#FEF2F2",
    defaultLabel: "Cancelled",
    dotColor: "#991B1B",
  },
  failed: {
    color: "#991B1B",
    background: "#FEF2F2",
    defaultLabel: "Failed",
    dotColor: "#991B1B",
  },
  late: {
    color: "#DC2626",
    background: "#FEE2E2",
    defaultLabel: "Late",
    dotColor: "#DC2626",
  },
  danger: {
    color: "#DC2626",
    background: "#FEE2E2",
    defaultLabel: "Late",
    dotColor: "#DC2626",
  },
  delivered_late: {
    color: "#D97706",
    background: "#FEF3C7",
    defaultLabel: "Delivered late",
    dotColor: "#D97706",
  },
  draft: {
    color: "#475569",
    background: "#F1F5F9",
    defaultLabel: "Draft",
    dotColor: "#475569",
  },
  neutral: {
    color: "#475569",
    background: "#F1F5F9",
    defaultLabel: "Neutral",
    dotColor: "#475569",
  },
  disputed: {
    color: "#B45309",
    background: "#FEF3C7",
    defaultLabel: "Disputed",
    dotColor: "#B45309",
  },
};

const SIZE_STYLES: Record<TagSize, { className: string; fontSize?: string }> = {
  sm: {
    className: "text-[12px] px-3 py-1 gap-1.5",
    fontSize: "12px",
  },
  md: {
    className: "text-[13px] px-4 py-1.5 gap-2",
    fontSize: "16px",
  },
  lg: {
    className: "text-[14px] px-5 py-2 gap-2.5",
    fontSize: "18px",
  },
};

export const Tag = forwardRef<HTMLElement, TagProps>(
  (
    {
      variant = "inprogress",
      size = "md",
      dot = false,
      leftIcon,
      rightIcon,
      children,
      as = "span",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    // Normalize variant key (case-insensitive, convert dashes and spaces to underscores)
    const normalizedKey = String(variant || "")
      .trim()
      .toLowerCase()
      .replace(/[-\s]/g, "_");

    const config =
      VARIANT_CONFIGS[normalizedKey] ||
      VARIANT_CONFIGS[normalizedKey.replace(/^in_/, "")] ||
      VARIANT_CONFIGS[`in_${normalizedKey}`] ||
      VARIANT_CONFIGS[normalizedKey.replace(/_/g, "")] ||
      VARIANT_CONFIGS.in_progress;

    const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;
    const Component = as as any;

    const baseStyle: React.CSSProperties = {
      fontFamily: '"SF Pro", var(--font-sf-pro), -apple-system, BlinkMacSystemFont, sans-serif',
      fontStyle: "normal",
      fontWeight: 510,
      lineHeight: "normal",
      borderRadius: "60px",
      border: "1px solid rgba(0, 0, 0, 0.10)",
      color: config.color,
      background: config.background,
      fontSize: sizeConfig.fontSize,
      ...style,
    };

    const content = children !== undefined ? children : config.defaultLabel;

    return (
      <Component
        ref={ref}
        style={baseStyle}
        className={`inline-flex items-center justify-center whitespace-nowrap select-none transition-colors ${sizeConfig.className} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: config.dotColor }}
            aria-hidden="true"
          />
        )}
        {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{content}</span>
        {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </Component>
    );
  }
);

Tag.displayName = "Tag";

export default Tag;
