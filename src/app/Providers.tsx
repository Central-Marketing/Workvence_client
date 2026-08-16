"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster, useToasterStore, toast } from "react-hot-toast";
import { GlobalSocketListener } from "@/components";

function ToastLimitEnforcer({ limit = 3 }: { limit?: number }) {
  const { toasts } = useToasterStore();

  useEffect(() => {
    const visibleToasts = toasts.filter((t) => t.visible);
    if (visibleToasts.length > limit) {
      // Dismiss older toasts exceeding the max limit
      visibleToasts.slice(limit).forEach((t) => toast.dismiss(t.id));
    }
  }, [toasts, limit]);

  return null;
}

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
      <Toaster position="bottom-right" reverseOrder={false} toastOptions={{ duration: 4000 }} />
      <ToastLimitEnforcer limit={3} />
      <GlobalSocketListener />
      {children}
    </QueryClientProvider>
  );
}
