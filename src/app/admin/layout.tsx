"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import socket from "@/utils/socket";
import adminAxios from "@/utils/adminAxios";
import { useUserStore } from "@/store/userStore";
import { Loader, Button } from "@/components";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  // Auth check via admin backend /auth/me
  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminAxios.get("/auth/me");
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          socket.disconnect();
          localStorage.removeItem("user");
          setUser(null);
          router.push("/login");
        }
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  // Logout
  const logoutMutation = useMutation({
    mutationFn: () => adminAxios.post("/auth/logout"),
    onSuccess: () => {
      socket.disconnect();
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    },
    onError: () => {
      socket.disconnect();
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    },
  });

  // Refresh analytics cache
  const refreshMutation = useMutation({
    mutationFn: () => adminAxios.post("/analytics/refresh"),
    onSuccess: () => {
      toast.success("Analytics cache refreshed");
      window.location.reload();
    },
    onError: () => {
      toast.error("Failed to refresh cache");
    },
  });

  if (checking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f1f5f9",
        }}
      >
        <Loader size={45} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => logoutMutation.mutate()}
      />

      <div className="flex-1 ml-[260px] max-[900px]:ml-0 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white px-8 py-4 border-b border-[#e2e8f0] flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="hidden max-[900px]:flex bg-transparent border border-[#e2e8f0] rounded-[8px] p-2 cursor-pointer text-[#64748b] text-[20px] hover:bg-[#f1f5f9] !p-2 !min-h-0 !h-auto"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle menu"
            >
              ☰
            </Button>
            <span className="text-[18px] font-bold text-[#0f172a]">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="px-4 py-2 rounded-[8px] text-[13px] font-semibold bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0] cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-[#e2e8f0] disabled:opacity-50 disabled:cursor-not-allowed !p-2 sm:!p-[8px_16px] !min-h-0 !h-auto"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              isLoading={refreshMutation.isPending}
            >
              🔄 {refreshMutation.isPending ? "Refreshing..." : "Refresh Data"}
            </Button>
            <span className="flex items-center gap-1.5 text-[13px] text-[#64748b] before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-[#10b981]">
              System Online
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-7 md:px-8 max-md:p-4">{children}</main>
      </div>
    </div>
  );
}
