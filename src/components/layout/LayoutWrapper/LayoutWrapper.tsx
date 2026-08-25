"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer, KycPromptModal } from "@/components";
import React from "react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  const isMessagePage = pathname === "/messages" || pathname.startsWith("/message/");
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && !isAdminPage && <Navbar />}
      {!isAdminPage && <KycPromptModal />}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!isMessagePage && !isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
}
