import React from "react";

export type ButtonVariant =
  | "brand"       // Workvence brand green (#0D6D5F)
  | "primary"     // Alias for brand
  | "emerald"     // Success emerald (#10B981)
  | "dark"        // Solid black / dark neutral
  | "black"       // Alias for dark
  | "outline"     // Bordered white surface
  | "soft"        // Light gray/muted surface (#EAECEF / #F4F5F7)
  | "secondary"   // Alias for soft
  | "danger"      // Solid destructive red
  | "danger-soft" // Soft tinted red border
  | "ghost"       // Transparent minimal
  | "pill-tab";   // Segmented filter pill

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "icon";

export type ButtonRadius =
  | "fiverr"         // rounded-[6px] (Fiverr modern standard)
  | "fiverr-classic" // rounded-[4px] (Fiverr classic compact)
  | "md"             // rounded-md (6px)
  | "lg"             // rounded-[8px]
  | "xl"             // rounded-xl (12px, Workvence card standard)
  | "2xl"            // rounded-2xl (16px)
  | "full"           // rounded-full (Pill button)
  | "none";          // rounded-none (Square button)

export const buttonVariantStyles: Record<ButtonVariant, string> = {
  brand:
    "bg-[#0D6D5F] hover:bg-[#0b5c50] text-white shadow-xs active:scale-[0.99] border border-transparent",
  primary:
    "bg-[#0D6D5F] hover:bg-[#0b5c50] text-white shadow-xs active:scale-[0.99] border border-transparent",
  emerald:
    "bg-[#10B981] hover:bg-emerald-600 text-white shadow-xs active:scale-[0.99] border border-transparent",
  dark:
    "bg-black hover:bg-gray-900 text-white shadow-sm active:scale-[0.99] border border-transparent",
  black:
    "bg-black hover:bg-gray-900 text-white shadow-sm active:scale-[0.99] border border-transparent",
  outline:
    "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs active:scale-[0.99]",
  soft:
    "bg-[#EDEDED] hover:bg-[#E0E0E0] text-[#292929] hover:text-gray-950 shadow-2xs active:scale-[0.99] border border-transparent",
  secondary:
    "bg-[#EDEDED] hover:bg-[#E0E0E0] text-[#292929] hover:text-gray-950 shadow-2xs active:scale-[0.99] border border-transparent",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-[0.99] border border-transparent",
  "danger-soft":
    "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 active:scale-[0.99]",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-transparent",
  "pill-tab":
    "bg-[var(--Foundation-White-white-300,#F5F5F5)] hover:text-gray-900 text-[var(--Foundation-Grey-grey-400,#6E6E6E)] border border-[rgba(0,0,0,0.10)]",
};

export const buttonSizeStyles: Record<ButtonSize, string> = {
  xs:
    "text-[11px] sm:text-xs macbook:text-xs 2xl:text-[13px] px-2.5 py-1 min-h-[28px] gap-1.5 leading-tight",
  sm:
    "text-xs min-[400px]:text-[13px] sm:text-sm 2xl:text-sm px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] gap-1.5 leading-tight",
  md:
    "text-[16px] px-4 sm:px-5 h-[40px] gap-2 leading-none",
  lg:
    "text-sm sm:text-base macbook:text-base 2xl:text-[17px] px-5 sm:px-6 py-2.5 sm:py-3 min-h-[46px] sm:min-h-[48px] gap-2 leading-tight",
  xl:
    "text-base sm:text-lg macbook:text-lg 2xl:text-xl px-6 sm:px-7 py-3 sm:py-3.5 min-h-[52px] sm:min-h-[56px] gap-2.5 leading-tight",
  icon:
    "p-2 w-9 h-9 min-h-[36px] flex items-center justify-center shrink-0",
};

export const buttonRadiusStyles: Record<ButtonRadius, string> = {
  fiverr: "rounded-[6px]",          // Fiverr modern default
  "fiverr-classic": "rounded-[4px]", // Fiverr compact classic
  md: "rounded-md",
  lg: "rounded-[8px]",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
  none: "rounded-none",
};

export const buttonIconSizeStyles: Record<ButtonSize, string> = {
  xs: "w-3 h-3 text-[12px]",
  sm: "w-3.5 h-3.5 text-[14px]",
  md: "w-4 h-4 text-[16px]",
  lg: "w-[18px] h-[18px] text-[18px]",
  xl: "w-5 h-5 text-[20px]",
  icon: "w-4 h-4 sm:w-[18px] sm:h-[18px]",
};
