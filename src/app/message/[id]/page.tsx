"use client";

import { Suspense } from "react";
import { ChatView } from "@/features/chat";
import { ChatSkeleton } from "@/components/ui";

export default function MessageDetailPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatView />
    </Suspense>
  );
}