"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import { CookiePreferencesModal, CookieCategories } from "./CookiePreferencesModal";

const STORAGE_KEY = "workvence_cookie_consent";
const COOKIE_NAME = "cookie_consent";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60; // 31,536,000s
const POLICY_VERSION = "1.0";

const DEFAULT_CATEGORIES: CookieCategories = {
  essential: true,
  analytics: true,
  marketing: true,
  functional: true,
};

export const CookieBanner: React.FC = () => {
  const user = useUserStore((state: any) => state.user);
  const [isVisible, setIsVisible] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // 1. Check if user already gave consent on initial client mount
  useEffect(() => {
    try {
      // Check document.cookie
      const hasCookie = document.cookie
        .split("; ")
        .some((item) => item.startsWith(`${COOKIE_NAME}=`));

      // Check localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          return; // Valid consent exists, keep hidden
        }
      }

      if (hasCookie) {
        return; // Valid cookie exists, keep hidden
      }

      // No consent recorded -> display banner
      setIsVisible(true);
    } catch {
      // Fallback: show banner if storage read fails
      setIsVisible(true);
    }
  }, []);

  // 2. Build full marketplace telemetry payload
  const buildMarketplacePayload = useCallback(
    (consent: "accepted" | "declined" | "custom", categories: CookieCategories) => {
      let affiliateId = "";
      let utmSource = "";
      let utmMedium = "";
      let utmCampaign = "";

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        affiliateId = params.get("ref") || params.get("aff") || params.get("affiliate") || "";
        utmSource = params.get("utm_source") || "";
        utmMedium = params.get("utm_medium") || "";
        utmCampaign = params.get("utm_campaign") || "";
      }

      const timezone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "UTC";

      const screenResolution =
        typeof window !== "undefined"
          ? `${window.screen.width}x${window.screen.height}`
          : "unknown";

      return {
        consent,
        categories,
        user: {
          id: user?._id || user?.id || null,
          role: user?.isSeller ? "seller" : user ? "buyer" : "guest",
        },
        attribution: {
          affiliateId: affiliateId || null,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
        },
        environment: {
          timezone,
          timezoneOffset: new Date().getTimezoneOffset(),
          screenResolution,
          language: typeof navigator !== "undefined" ? navigator.language : "en",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          entryPage: typeof window !== "undefined" ? window.location.pathname : "/",
        },
        compliance: {
          version: POLICY_VERSION,
          timestamp: new Date().toISOString(),
        },
      };
    },
    [user]
  );

  // 3. Dispatch payload to backend (sendBeacon with axiosFetch 5s timeout fallback)
  const dispatchPayloadToBackend = useCallback((payload: any) => {
    try {
      const jsonString = JSON.stringify(payload);

      // Method A: navigator.sendBeacon (preferred for fire-and-forget consent events)
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([jsonString], { type: "application/json" });
        const sent = navigator.sendBeacon("/api/cookie-consent", blob);
        if (sent) return;
      }

      // Method B: axiosFetch fallback with 5-second AbortController timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      axiosFetch
        .post("/cookie-consent", payload, {
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        })
        .catch(() => {
          // Gracefully suppress errors if backend endpoint is not yet mounted
        })
        .finally(() => {
          clearTimeout(timeoutId);
        });
    } catch {
      // Fire-and-forget; never interrupt user interaction
    }
  }, []);

  // 4. Save consent state to device (cookie + localStorage for 365 days)
  const saveConsent = useCallback(
    (consent: "accepted" | "declined" | "custom", categories: CookieCategories) => {
      setIsDismissing(true);

      const expiresAt = Date.now() + ONE_YEAR_SECONDS * 1000;
      const consentRecord = {
        consent,
        categories,
        version: POLICY_VERSION,
        timestamp: new Date().toISOString(),
        expiresAt,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consentRecord));
        document.cookie = `${COOKIE_NAME}=${consent}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
      } catch (err) {
        console.warn("Could not save cookie consent locally:", err);
      }

      // Dispatch marketplace telemetry
      const payload = buildMarketplacePayload(consent, categories);
      dispatchPayloadToBackend(payload);

      // Animate out and unmount
      setTimeout(() => {
        setIsVisible(false);
        setIsDismissing(false);
      }, 250);
    },
    [buildMarketplacePayload, dispatchPayloadToBackend]
  );

  const handleAcceptAll = () => {
    saveConsent("accepted", {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
    setIsPreferencesOpen(false);
  };

  const handleDeclineAll = () => {
    saveConsent("declined", {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
    setIsPreferencesOpen(false);
  };

  const handleSaveCustom = (customCategories: CookieCategories) => {
    saveConsent("custom", customCategories);
    setIsPreferencesOpen(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Cookie Banner Card (Positioned bottom-right corner) */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[990] max-w-[560px] w-[calc(100%-2rem)] sm:w-auto bg-white rounded-[12px] p-6 sm:p-7 shadow-[0_12px_44px_rgba(0,0,0,0.12)] border border-slate-100 transition-all duration-250 ease-out ${
          isDismissing
            ? "opacity-0 translate-y-3 pointer-events-none"
            : "opacity-100 translate-y-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
        }`}
        role="region"
        aria-label="Cookie consent banner"
      >
        {/* Description text with embedded links */}
        <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#2B3445]">
          We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience, personalize content, and analyze website traffic. For these reasons, we may share your site usage data with our social media and analytics partners. By clicking &ldquo;Accept,&rdquo; you agree to our website&apos;s cookie use as described in our{" "}
          <Link
            href="/privacy"
            className="underline font-medium text-slate-900 hover:text-brand-green transition-colors"
          >
            Cookie Policy
          </Link>
          . You can change your cookie settings at any time by clicking{" "}
          <button
            type="button"
            onClick={() => setIsPreferencesOpen(true)}
            className="underline font-medium text-slate-900 hover:text-brand-green transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            &ldquo;Preferences.&rdquo;
          </button>
        </p>

        {/* Buttons Row (Matching Screenshot layout and styling) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pt-5">
          {/* Preferences Button (White bg, #0B403F border and text) */}
          <Button
            type="button"
            variant="outline"
            size="md"
            radius="fiverr"
            onClick={() => setIsPreferencesOpen(true)}
            className="h-[42px] px-5 text-sm font-semibold !bg-white hover:!bg-slate-50 !border !border-[#0B403F] !text-[#0B403F] transition-colors cursor-pointer"
          >
            Preferences
          </Button>

          {/* Decline Button (Brand Green: #0B403F) */}
          <Button
            type="button"
            variant="brand"
            size="md"
            radius="fiverr"
            onClick={handleDeclineAll}
            className="h-[42px] px-6 text-sm font-semibold !bg-[#0B403F] hover:!bg-[#082E2D] !text-white transition-colors cursor-pointer shadow-xs"
          >
            Decline
          </Button>

          {/* Accept Button (Brand Green: #0B403F) */}
          <Button
            type="button"
            variant="brand"
            size="md"
            radius="fiverr"
            onClick={handleAcceptAll}
            className="h-[42px] px-7 text-sm font-semibold !bg-[#0B403F] hover:!bg-[#082E2D] !text-white transition-colors cursor-pointer shadow-xs"
          >
            Accept
          </Button>
        </div>
      </div>

      {/* Preferences Modal */}
      <CookiePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        initialCategories={DEFAULT_CATEGORIES}
        onSave={handleSaveCustom}
        onAcceptAll={handleAcceptAll}
      />
    </>
  );
};

export default CookieBanner;
