"use client";

import { Suspense } from "react";
import { ChatView } from "@/features/chat";
import { Loader } from "@/components";

export default function MessagePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <Loader size={40} />
        </div>
      }
    >
      <ChatView />
    </Suspense>
  );
}
