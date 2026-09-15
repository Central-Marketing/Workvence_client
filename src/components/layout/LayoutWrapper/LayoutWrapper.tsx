"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer, KycPromptModal } from "@/components";
import React from "react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  const isChatDetailPage = pathname.startsWith("/message/") || pathname === "/message";
  const isMessagePage = pathname === "/messages" || pathname.startsWith("/message");
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <div className={`flex flex-col ${isChatDetailPage ? 'h-screen h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      {!isAuthPage && !isAdminPage && !isChatDetailPage && <Navbar />}
      {!isAdminPage && <KycPromptModal />}
      <main id="main-content" className={`flex-1 min-h-0 ${isChatDetailPage ? 'overflow-hidden flex flex-col h-full max-h-full' : ''}`}>
        {children}
      </main>
      {!isMessagePage && !isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
}
