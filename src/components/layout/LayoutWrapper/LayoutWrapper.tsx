"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer, KycPromptModal } from "@/components";
import React from "react";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  const isChatDetailPage = pathname.startsWith("/message/") || pathname === "/message";
  const isMessagePage = pathname === "/messages" || pathname.startsWith("/message");
  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isOnboardingPage =
    pathname.startsWith("/seller/onboarding") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/");
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <div className={`flex flex-col overflow-x-clip w-full max-w-full ${isChatDetailPage ? 'h-screen h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      {!isAuthPage && !isOnboardingPage && !isAdminPage && !isChatDetailPage && <Navbar />}
      {!isAdminPage && !isAuthPage && !isOnboardingPage && <KycPromptModal />}
      <main id="main-content" className={`flex-1 min-h-0 ${isChatDetailPage ? 'overflow-hidden flex flex-col h-full max-h-full' : ''}`}>
        {children}
      </main>
      {!isMessagePage && !isAuthPage && !isOnboardingPage && !isAdminPage && <Footer />}
    </div>
  );
}
