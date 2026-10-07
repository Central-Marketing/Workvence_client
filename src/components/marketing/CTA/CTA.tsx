"use client";

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components';
import { ButtonVariant, ButtonRadius, ButtonSize } from '@/components/ui/Button/buttonVariants';

export interface CTAButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode;
  variant?: ButtonVariant;
  radius?: ButtonRadius;
  size?: ButtonSize;
  className?: string;
  target?: string;
  rel?: string;
}

export interface CTABadgeProps {
  text?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export interface CTAProps {
  /**
   * Title/headline. Can be a string or custom JSX (e.g. with <br />).
   * Defaults to homepage text if unspecified: "Are You A Freelancer?\nEarn Globally."
   */
  title?: ReactNode;

  /**
   * Subtitle / description paragraph. Can be a string or custom JSX.
   * Defaults to homepage description if unspecified.
   */
  description?: ReactNode;

  /**
   * Top badge content.
   * - If undefined on default homepage mode: shows 100% moneyback guarantee badge.
   * - If undefined with a custom title: badge is omitted.
   * - Pass a string, ReactNode, or CTABadgeProps to display a custom badge.
   * - Pass `false` or `null` to explicitly hide the badge.
   */
  badge?: ReactNode | CTABadgeProps | boolean | 'default' | null;

  /**
   * Shorthand primary button configuration
   */
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  buttonIcon?: ReactNode;
  buttonClassName?: string;
  buttonVariant?: ButtonVariant;
  buttonRadius?: ButtonRadius;

  /**
   * Structured button configuration
   */
  primaryButton?: CTAButtonProps;
  secondaryButton?: CTAButtonProps;

  /**
   * Custom actions slot (rendered in place of or alongside the buttons)
   */
  actions?: ReactNode;

  /**
   * Right side content slot for 2-column layouts (e.g., metrics, graphics)
   */
  rightContent?: ReactNode;

  /**
   * Background image path. Defaults to '/media/AFreelancerBG.png'.
   */
  bgImage?: string;

  /**
   * Background image alt text. Defaults to title or fallback.
   */
  bgAlt?: string;

  /**
   * Aspect ratio & height classes for the frame. Defaults to 'lg:aspect-[1760/700] 2xl:h-[700px]'.
   */
  aspectRatioClass?: string;

  /**
   * Additional class name for the wrapper <section>.
   */
  className?: string;

  /**
   * Additional class name for container.
   */
  containerClassName?: string;

  /**
   * Additional class name for the inner banner container.
   */
  bannerClassName?: string;

  /**
   * Priority loading for Next.js Image. Defaults to true.
   */
  priority?: boolean;

  /**
   * Optional custom children rendered inside the content column.
   */
  children?: ReactNode;
}

const MoneybackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 11C3 8.23571 5.23571 6 8 6L7 8.5" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 13C21 15.7643 18.7643 18 16 18L17 15.5" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.3333 10H14.6667C12.9382 10 12.0739 10 11.537 9.48744C11 8.97487 11 8.14992 11 6.5C11 4.85008 11 4.02513 11.537 3.51256C12.0739 3 12.9382 3 14.6667 3H18.3333C20.0618 3 20.9261 3 21.463 3.51256C22 4.02513 22 4.85008 22 6.5C22 8.14992 22 8.97487 21.463 9.48744C20.0618 10 20.0618 10 18.3333 10Z" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.33333 21H5.66667C3.93818 21 3.07394 21 2.53697 20.4874C2 19.9749 2 19.1499 2 17.5C2 15.8501 2 15.0251 2.53697 14.5126C3.07394 14 3.93818 14 5.66667 14H9.33333C11.0618 14 11.9261 14 12.463 14.5126C13 15.0251 13 15.8501 13 17.5C13 19.1499 13 19.9749 12.463 20.4874C11.9261 21 11.0618 21 9.33333 21Z" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.75 17.5H7.5M8 17.5C8 17.7761 7.77614 18 7.5 18C7.22386 18 7 17.7761 7 17.5C7 17.2239 7.22386 17 7.5 17C7.77614 17 8 17.2239 8 17.5Z" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.75 6.5H16.5M17 6.5C17 6.77614 16.7761 7 16.5 7C16.2239 7 16 6.77614 16 6.5C16 6.22386 16.2239 6 16.5 6C16.7761 6 17 6.22386 17 6.5Z" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CTA: React.FC<CTAProps> = ({
  title,
  description,
  badge,
  buttonText,
  buttonHref,
  onButtonClick,
  buttonIcon,
  buttonClassName = "",
  buttonVariant,
  buttonRadius = "fiverr",
  primaryButton,
  secondaryButton,
  actions,
  rightContent,
  bgImage = "/media/AFreelancerBG.png",
  bgAlt,
  aspectRatioClass = "lg:aspect-[1760/700] 2xl:h-[700px]",
  className = "",
  containerClassName = "",
  bannerClassName = "",
  priority = true,
  children,
}) => {
  const isDefaultHomepage = !title && !description && !primaryButton && !buttonText && !actions;

  // Resolve Badge
  let renderedBadge: ReactNode = null;
  if (badge === true || badge === "default" || (badge === undefined && isDefaultHomepage)) {
    renderedBadge = (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#EAFDC6] text-[#244E18] font-sf-pro font-medium text-[12px] sm:text-[13px] shadow-sm">
        <MoneybackIcon />
        <span>100% moneyback guarantee</span>
      </div>
    );
  } else if (typeof badge === "string") {
    renderedBadge = (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#EAFDC6] text-[#244E18] font-sf-pro font-medium text-[12px] sm:text-[13px] shadow-sm">
        <span>{badge}</span>
      </div>
    );
  } else if (React.isValidElement(badge)) {
    renderedBadge = badge;
  } else if (badge && typeof badge === "object" && ("text" in badge || "icon" in badge)) {
    const badgeObj = badge as CTABadgeProps;
    renderedBadge = (
      <div
        className={
          badgeObj.className ||
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#EAFDC6] text-[#244E18] font-sf-pro font-medium text-[12px] sm:text-[13px] shadow-sm"
        }
      >
        {badgeObj.icon}
        {badgeObj.text && <span>{badgeObj.text}</span>}
      </div>
    );
  }

  // Resolve Primary Button
  const resolvedPrimaryButton: CTAButtonProps | null = (() => {
    if (primaryButton) return primaryButton;
    if (buttonText) {
      return {
        text: buttonText,
        href: buttonHref,
        onClick: onButtonClick,
        rightIcon: buttonIcon ?? <ArrowRight size={16} strokeWidth={2} />,
        className: buttonClassName,
        variant: buttonVariant,
        radius: buttonRadius,
      };
    }
    if (isDefaultHomepage) {
      return {
        text: "Become A Seller",
        href: "/register?seller=true",
        rightIcon: <ArrowRight size={16} strokeWidth={2} />,
        radius: "fiverr",
      };
    }
    return null;
  })();

  const renderButton = (btn: CTAButtonProps, isSecondary = false) => {
    const defaultClass = isSecondary
      ? "bg-transparent hover:bg-white/10 text-white border-white/30 font-semibold h-[40px] text-[16px] px-6 shadow-sm"
      : "bg-white hover:bg-gray-100 text-[#112131] border-transparent font-semibold h-[40px] text-[16px] px-6 shadow-sm";

    return (
      <Button
        key={btn.text}
        href={btn.href}
        onClick={btn.onClick}
        target={btn.target}
        rel={btn.rel}
        variant={btn.variant || (isSecondary ? "outline" : "brand")}
        size={btn.size || "md"}
        radius={btn.radius || "fiverr"}
        leftIcon={btn.leftIcon}
        rightIcon={btn.rightIcon ?? (btn.icon || (!isSecondary ? <ArrowRight size={16} strokeWidth={2} /> : undefined))}
        className={`${defaultClass} ${btn.className || ""}`.trim()}
      >
        {btn.text}
      </Button>
    );
  };

  const resolvedAlt =
    bgAlt ||
    (typeof title === "string"
      ? title
      : "Are You A Freelancer? Earn Globally.");

  return (
    <section className={`w-full pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-[80px] min-[1400px]:pb-[100px] ${className}`.trim()}>
      <div className={`w-full container mx-auto px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 ${containerClassName}`.trim()}>
        {/* Main Background Frame */}
        <div
          className={`relative isolate w-full max-w-[1760px] mx-auto rounded-[6px] overflow-hidden shadow-xs flex items-center min-h-[460px] sm:min-h-[500px] md:min-h-[540px] ${aspectRatioClass} px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 py-12 sm:py-16 md:py-20 lg:py-0 ${bannerClassName}`.trim()}
        >
          {/* Background Image */}
          <Image
            src={bgImage}
            alt={resolvedAlt}
            fill
            priority={priority}
            quality={100}
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1536px) 100vw, 1760px"
            className="object-cover object-right md:object-center select-none pointer-events-none z-0"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full relative z-10">
            {/* Left Content Column */}
            <div className={`${rightContent ? "lg:col-span-7" : "lg:col-span-7"} flex flex-col items-start justify-center`}>
              {/* Optional Badge */}
              {renderedBadge && <div className="mb-1">{renderedBadge}</div>}

              {/* Main Headline */}
              <h2 className="font-sf-pro font-[510] text-3xl leading-[normal] sm:text-4xl sm:leading-[normal] lg:text-[44px] lg:leading-[normal] xl:text-[48px] xl:leading-[normal] text-white mb-4 sm:mb-5 my-4">
                {title ?? (
                  <>
                    Are You A Freelancer?
                    <br />
                    Earn Globally.
                  </>
                )}
              </h2>

              {/* Description Paragraph */}
              <p className="font-inter font-normal text-base sm:text-[15px] text-white md:text-[#C7C7C7] mb-5 sm:mb-10 max-w-xl leading-relaxed">
                {description ?? (
                  <>
                    Reach international buyers, get paid in full with fast, secure payouts, and grow your
                    business on a platform built on trust. Applications are reviewed to keep quality high.
                  </>
                )}
              </p>

              {/* Action Buttons */}
              {actions ? (
                <div className="flex flex-wrap items-center justify-start gap-4">
                  {actions}
                </div>
              ) : (resolvedPrimaryButton || secondaryButton) ? (
                <div className="flex flex-wrap items-center justify-start gap-4">
                  {resolvedPrimaryButton && renderButton(resolvedPrimaryButton, false)}
                  {secondaryButton && renderButton(secondaryButton, true)}
                </div>
              ) : null}

              {/* Custom children inside left column */}
              {children}
            </div>

            {/* Right Content Column (if provided) */}
            {rightContent && (
              <div className="lg:col-span-5 flex items-center justify-center">
                {rightContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;