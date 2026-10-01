"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { GlobalSocketListener, GlobalAuthModal } from "@/components";

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
      <Toaster position="bottom-right" richColors visibleToasts={3} duration={4000} closeButton />
      <GlobalSocketListener />
      <GlobalAuthModal />
      {children}
    </QueryClientProvider>
  );
}
