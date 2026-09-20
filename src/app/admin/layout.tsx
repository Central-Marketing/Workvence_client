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
import "./AdminLayout.scss";

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
    <div className="admin-layout">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => logoutMutation.mutate()}
      />

      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="mobile-menu-btn !p-0 !min-h-0 !h-auto"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle menu"
            >
              ☰
            </Button>
            <span className="page-title">Admin Panel</span>
          </div>
          <div className="topbar-right">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="refresh-btn !p-0 !min-h-0 !h-auto"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              isLoading={refreshMutation.isPending}
            >
              🔄 {refreshMutation.isPending ? "Refreshing..." : "Refresh Data"}
            </Button>
            <span className="status-dot">System Online</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
