"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { Breadcrumb, BreadcrumbItem } from "../Breadcrumb/Breadcrumb";
import { Button } from "../Button";

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  homeHref?: string;
  homeTitle?: string;
  showHome?: boolean;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  backTitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  homeHref = "/dashboard/seller",
  homeTitle = "Dashboard",
  showHome = true,
  actions,
  badge,
  backHref,
  onBack,
  backTitle = "Back",
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}) => {
  return (
    <div className={`space-y-4 sm:space-y-5 ${className}`}>
      {/* 1. Breadcrumb navigation (if items provided) */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          homeHref={homeHref}
          homeTitle={homeTitle}
          showHome={showHome}
          items={breadcrumbs}
          className="mb-0"
        />
      )}

      {/* 2. Header row: Title + Subtitle on Left, Actions on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Optional Back Button */}
            {(backHref || onBack) && (
              backHref ? (
                <Link
                  href={backHref}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shrink-0"
                  title={backTitle}
                >
                  <FiArrowLeft className="w-4 h-4" />
                </Link>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  radius="fiverr"
                  onClick={onBack}
                  className="w-8 h-8 !p-0 inline-flex items-center justify-center shrink-0 border-gray-200"
                  title={backTitle}
                >
                  <FiArrowLeft className="w-4 h-4" />
                </Button>
              )
            )}

            <h1
              className={`text-xl sm:text-2xl md:text-[28px] font-bold font-sf-pro text-[#292929] tracking-tight leading-tight m-0 ${titleClassName}`}
            >
              {title}
            </h1>

            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {subtitle && (
            <p
              className={`text-xs sm:text-[14px] text-[#6E6E6E] font-normal font-inter leading-relaxed max-w-2xl m-0 ${subtitleClassName}`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons or Filter Controls */}
        {actions && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
