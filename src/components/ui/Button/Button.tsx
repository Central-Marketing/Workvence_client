"use client";

import React, { forwardRef, ReactNode } from "react";
import Link from "next/link";
import {
  ButtonVariant,
  ButtonSize,
  ButtonRadius,
  buttonVariantStyles,
  buttonSizeStyles,
  buttonRadiusStyles,
  buttonIconSizeStyles,
} from "./buttonVariants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
  href?: string;
  target?: string;
  rel?: string;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      variant = "brand",
      size = "md",
      radius = "fiverr",
      href,
      target,
      rel,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      icon,
      fullWidth = false,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isIconOnly = Boolean((icon && !children) || size === "icon");
    const resolvedSize = isIconOnly ? "icon" : size;

    const rawVariant = buttonVariantStyles[variant] || buttonVariantStyles.brand;
    const rawSize = buttonSizeStyles[resolvedSize] || buttonSizeStyles.md;
    const rawRadius = buttonRadiusStyles[radius] || buttonRadiusStyles.fiverr;

    const standardActionVariants: ButtonVariant[] = [
      "brand",
      "primary",
      "emerald",
      "dark",
      "black",
      "soft",
      "secondary",
      "outline",
      "danger",
      "danger-soft",
    ];

    const isFixed40Variant =
      !isIconOnly &&
      standardActionVariants.includes(variant) &&
      size !== "lg" &&
      size !== "xl";

    let effectiveSizeClasses = rawSize;
    if (isFixed40Variant) {
      effectiveSizeClasses = rawSize
        .split(/\s+/)
        .filter(
          (t) =>
            !t.startsWith("min-h-") &&
            !t.startsWith("h-") &&
            !/text-(xs|sm|base|lg|xl|\[\d+px\])/.test(t) &&
            t !== "font-semibold" &&
            t !== "font-medium"
        )
        .concat(["h-[40px]", "text-[16px]", "font-semibold"])
        .join(" ");
    }

    let variantClasses = rawVariant;
    if (className) {
      const userTokens = className.trim().split(/\s+/);
      const isNonColorTextToken = (t: string) =>
        /!?text-(xs|sm|base|lg|xl|\d+xl|\[\d+px\]|left|center|right|justify|start|end|ellipsis|clip|wrap|nowrap|balance|pretty)/.test(
          t
        );
      const hasCustomBg = userTokens.some((t) => t.startsWith("bg-") || t.startsWith("!bg-"));
      const hasCustomHoverBg = userTokens.some((t) => t.startsWith("hover:bg-") || t.startsWith("hover:!bg-"));
      const hasCustomText = userTokens.some(
        (t) => (t.startsWith("text-") || t.startsWith("!text-")) && !isNonColorTextToken(t)
      );
      const hasCustomHoverText = userTokens.some((t) => t.startsWith("hover:text-") || t.startsWith("hover:!text-"));
      const hasCustomBorder = userTokens.some((t) => t.startsWith("border-") || t === "border" || t.startsWith("!border"));
      const hasCustomHoverBorder = userTokens.some((t) => t.startsWith("hover:border") || t.startsWith("hover:!border"));

      if (hasCustomBg || hasCustomHoverBg || hasCustomText || hasCustomHoverText || hasCustomBorder || hasCustomHoverBorder) {
        variantClasses = rawVariant
          .split(/\s+/)
          .filter((t) => {
            if (hasCustomBg && t.startsWith("bg-")) return false;
            if (hasCustomHoverBg && t.startsWith("hover:bg-")) return false;
            if (hasCustomText && t.startsWith("text-") && !isNonColorTextToken(t)) return false;
            if (hasCustomHoverText && t.startsWith("hover:text-")) return false;
            if (hasCustomBorder && (t.startsWith("border-") || t === "border")) return false;
            if (hasCustomHoverBorder && t.startsWith("hover:border")) return false;
            return true;
          })
          .join(" ");
      }
    }

    const baseClasses = [
      "inline-flex items-center justify-center font-sf-pro font-semibold select-none",
      "transition-all duration-150 ease-in-out cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30 focus-visible:ring-offset-1",
      variantClasses,
      effectiveSizeClasses,
      rawRadius,
      fullWidth ? "w-full" : "",
      isLoading || disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconClasses = [
      "shrink-0 inline-flex items-center justify-center",
      isFixed40Variant
        ? buttonIconSizeStyles.md
        : (buttonIconSizeStyles[resolvedSize] || buttonIconSizeStyles.md),
    ].join(" ");

    const renderSpinner = () => (
      <svg
        className={`animate-spin ${iconClasses}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const content = (
      <>
        {/* Leading icon or spinner */}
        {isLoading && !rightIcon ? (
          renderSpinner()
        ) : leftIcon ? (
          <span className={iconClasses}>{leftIcon}</span>
        ) : null}

        {/* Icon-only mode */}
        {isIconOnly && !isLoading ? (
          <span className={iconClasses}>{icon || children}</span>
        ) : null}

        {/* Text Content */}
        {!isIconOnly && children !== undefined && children !== null ? (
          isLoading && loadingText ? (
            <span className="truncate">{loadingText}</span>
          ) : typeof children === "string" || typeof children === "number" ? (
            <span className="truncate">{children}</span>
          ) : (
            <span className="inline-flex items-center gap-2 max-w-full">
              {children}
            </span>
          )
        ) : null}

        {/* Trailing icon or trailing spinner if rightIcon exists */}
        {isLoading && rightIcon ? (
          renderSpinner()
        ) : rightIcon ? (
          <span className={iconClasses}>{rightIcon}</span>
        ) : null}
      </>
    );

    // If an href is provided, render as Next.js Link
    if (href && !disabled && !isLoading) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={baseClasses}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    // Default button element
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled || isLoading}
        className={baseClasses}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
