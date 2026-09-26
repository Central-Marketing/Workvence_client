"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "workvence:custom-design-modal:shown";

/**
 * Safely retrieve the set of package IDs for which the modal has already been shown in this browser session.
 */
function getShownPackageIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch (err) {
    console.warn("[usePackageModalSession] Error reading sessionStorage:", err);
    return new Set();
  }
}

/**
 * Safely record a package ID (and optional slug) into sessionStorage.
 */
function recordPackageAsShown(packageId: string, slug?: string): void {
  if (typeof window === "undefined" || !packageId) return;
  try {
    const current = getShownPackageIds();
    current.add(String(packageId).trim());
    if (slug) {
      current.add(String(slug).trim());
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch (err) {
    console.warn("[usePackageModalSession] Error writing sessionStorage:", err);
  }
}

/**
 * Custom hook to manage the 10-second delay and per-package sessionStorage tracking
 * for the Custom Design Proposal Modal.
 *
 * @param packageId - Unique ID or slug of the package
 * @param slug - Optional secondary identifier
 * @param isReady - Boolean indicating package data has finished loading
 * @param delayMs - Delay in milliseconds before triggering modal (default 10,000ms)
 */
export function usePackageModalSession(
  packageId?: string,
  slug?: string,
  isReady: boolean = false,
  delayMs: number = 10000
) {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timer when dependencies change
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Do not arm the timer if data is still loading or ID is missing
    if (!isReady || !packageId) {
      return;
    }

    const cleanId = String(packageId).trim();
    const cleanSlug = slug ? String(slug).trim() : undefined;

    // Check if this package has already displayed its modal during this browser tab session
    const shownSet = getShownPackageIds();
    if (shownSet.has(cleanId) || (cleanSlug && shownSet.has(cleanSlug))) {
      return;
    }

    // Arm the 10-second timer
    timerRef.current = setTimeout(() => {
      // Re-verify sessionStorage state prior to opening
      const latestSet = getShownPackageIds();
      if (!latestSet.has(cleanId) && (!cleanSlug || !latestSet.has(cleanSlug))) {
        recordPackageAsShown(cleanId, cleanSlug);
        setIsOpen(true);
      }
    }, delayMs);

    // Clean up timer on unmount or before running effect on ID change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [packageId, slug, isReady, delayMs]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    closeModal,
  };
}

export default usePackageModalSession;
