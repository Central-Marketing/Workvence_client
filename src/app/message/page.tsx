"use client";

import { Suspense } from "react";
import { ChatView } from "@/features/chat";
import { ChatSkeleton } from "@/components/ui";

export default function MessagePage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatView />
    </Suspense>
  );
}
