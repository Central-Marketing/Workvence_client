"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer } from "@/components";
import React from "react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  const isMessagePage = pathname === "/messages" || pathname.startsWith("/message/");
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

  return (
    <>
      {!isAuthPage && <Navbar />}
      {children}
      {!isMessagePage && !isAuthPage && <Footer />}
    </>
  );
}
