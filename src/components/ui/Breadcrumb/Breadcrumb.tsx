"use client";

import React from "react";
import Link from "next/link";
import { FiHome } from "react-icons/fi";

export interface BreadcrumbItem {
  name?: string;
  label?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isLast?: boolean;
  title?: string;
  className?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  onHomeClick?: () => void;
  homeTitle?: string;
  showHome?: boolean;
  className?: string;
  variant?: "default" | "inverted" | "coral";
  children?: React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  homeHref = "/",
  onHomeClick,
  homeTitle = "Home",
  showHome = true,
  className = "mb-3",
  variant = "default",
  children,
}) => {
  const isDefault = variant === "default";

  const homeColorClasses = isDefault
    ? "text-teal-600 hover:text-teal-700 focus-visible:ring-teal-600"
    : "text-white/80 hover:text-white focus-visible:ring-white/50";

  const separatorClasses = isDefault
    ? "text-gray-300 select-none"
    : "text-white/30 select-none";

  const inactiveLinkClasses = isDefault
    ? "text-gray-600 hover:text-gray-900 hover:underline transition-colors font-normal p-0 h-auto bg-transparent border-0 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 rounded-xs"
    : "text-white/70 hover:text-white hover:underline transition-colors font-normal p-0 h-auto bg-transparent border-0 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-xs";

  const activeClasses = isDefault
    ? "text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs"
    : "text-white font-medium truncate max-w-[200px] sm:max-w-xs";

  const listClasses = isDefault
    ? "flex items-center gap-2 text-[13px] text-gray-500 flex-wrap list-none p-0 m-0"
    : "flex items-center gap-2 text-[13px] text-white/70 flex-wrap list-none p-0 m-0";

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={listClasses}>
        {/* Home Icon */}
        {showHome && (
          <li className="inline-flex items-center">
            {onHomeClick ? (
              <button
                type="button"
                onClick={onHomeClick}
                className={`inline-flex items-center transition-colors p-0 h-auto bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-1 rounded-xs ${homeColorClasses}`}
                title={homeTitle}
                aria-label={homeTitle}
              >
                <FiHome className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            ) : (
              <Link
                href={homeHref}
                className={`inline-flex items-center transition-colors p-0 h-auto bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-1 rounded-xs ${homeColorClasses}`}
                title={homeTitle}
                aria-label={homeTitle}
              >
                <FiHome className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
            )}
          </li>
        )}

        {/* Dynamic Breadcrumb Items */}
        {items.map((item, idx) => {
          const itemText = item.name ?? item.label;
          const isItemLast = item.isLast ?? idx === items.length - 1;
          const itemTitle = item.title || (typeof itemText === "string" ? itemText : undefined);

          return (
            <li key={idx} className="inline-flex items-center gap-2">
              <span className={separatorClasses} aria-hidden="true">
                /
              </span>

              {isItemLast ? (
                <span
                  aria-current="page"
                  className={`${activeClasses} ${item.className || ""}`}
                  title={itemTitle}
                >
                  {itemText}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={`${inactiveLinkClasses} ${item.className || ""}`}
                  title={itemTitle}
                >
                  {itemText}
                </Link>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`${inactiveLinkClasses} ${item.className || ""}`}
                  title={itemTitle}
                >
                  {itemText}
                </button>
              ) : (
                <span className={`${inactiveLinkClasses} hover:no-underline cursor-default ${item.className || ""}`} title={itemTitle}>
                  {itemText}
                </span>
              )}
            </li>
          );
        })}

        {children}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
