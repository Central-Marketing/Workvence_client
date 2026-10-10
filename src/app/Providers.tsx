"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { GlobalSocketListener, GlobalAuthModal } from "@/components";
import { Bell, Check, AlertTriangle, Ban } from "lucide-react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="bottom-right"
        visibleToasts={3}
        duration={4000}
        closeButton
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "w-[356px] flex items-start gap-3 rounded-[6px] bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 transition-all overflow-hidden",
            title: "text-[14px] font-semibold text-[#112131] truncate block w-full",
            description: "text-[13px] text-[#64748b] font-medium line-clamp-2 mt-0.5",
            content: "flex-1 min-w-0 flex flex-col justify-center",
            actionButton:
              "mt-auto mb-auto ml-2 shrink-0 bg-[#0D6D5F] hover:bg-[#0b5c50] text-white px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors border-none cursor-pointer",
            cancelButton:
              "mt-auto mb-auto ml-2 shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors border-none cursor-pointer",
            closeButton:
              "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors border-none cursor-pointer",
            icon: "flex shrink-0 h-10 w-10 items-center justify-center rounded-[10px] text-white mt-0.5",
            success: "shadow-[0_8px_30px_-5px_rgba(34,197,94,0.15)] ring-0",
            error: "shadow-[0_8px_30px_-5px_rgba(239,68,68,0.15)] ring-0",
            warning: "shadow-[0_8px_30px_-5px_rgba(249,115,22,0.15)] ring-0",
            info: "shadow-[0_8px_30px_-5px_rgba(59,130,246,0.15)] ring-0",
            default: "shadow-[0_8px_30px_-5px_rgba(0,0,0,0.05)] ring-0",
          },
        }}
        icons={{
          success: (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#65d39e] shadow-sm">
              <Check className="h-5 w-5 text-white" strokeWidth={3} />
            </div>
          ),
          error: (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#ee9f95] shadow-sm">
              <Ban className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          ),
          warning: (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#fbc286] shadow-sm">
              <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          ),
          info: (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#81a1fa] shadow-sm">
              <Bell className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          ),
        }}
      />
      <GlobalSocketListener />
      <GlobalAuthModal />
      {children}
    </QueryClientProvider>
  );
}
