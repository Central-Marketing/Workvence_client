"use client";

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Folder } from 'lucide-react';

export interface CategoryIconProps {
  iconName?: string;
  iconUrl?: string;
  iconType?: 'lucide' | 'image' | string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  fallbackIcon?: React.ReactNode;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  iconUrl,
  iconType,
  className = "text-gray-700 w-10 h-10 md:w-12 md:h-12",
  style,
  alt = "Category Icon",
  fallbackIcon,
}) => {
  const rawIcon = iconName || iconUrl || '';

  if (!rawIcon) {
    if (fallbackIcon) return <>{fallbackIcon}</>;
    return <Folder className={className} style={style} strokeWidth={1.5} />;
  }

  const isExplicitLucide = iconType === 'lucide';
  const isExplicitImage = iconType === 'image';

  const isUrlFormat =
    typeof rawIcon === 'string' &&
    (rawIcon.startsWith('http://') ||
      rawIcon.startsWith('https://') ||
      rawIcon.startsWith('data:') ||
      rawIcon.startsWith('/') ||
      rawIcon.includes('.png') ||
      rawIcon.includes('.jpg') ||
      rawIcon.includes('.jpeg') ||
      rawIcon.includes('.webp') ||
      rawIcon.includes('.svg'));

  if (isExplicitImage || (isUrlFormat && !isExplicitLucide)) {
    return (
      <img
        src={rawIcon}
        alt={alt}
        className={`object-contain ${className}`}
        style={style}
      />
    );
  }

  // Treat rawIcon as Lucide icon string name
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>>)[rawIcon];

  if (IconComponent && typeof IconComponent !== 'string') {
    return <IconComponent className={className} style={style} strokeWidth={1.5} />;
  }

  if (fallbackIcon) return <>{fallbackIcon}</>;
  return <Folder className={className} style={style} strokeWidth={1.5} />;
};

export default CategoryIcon;
