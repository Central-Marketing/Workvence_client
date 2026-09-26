"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types";
import { Button } from "@/components/ui";

const NAV_ITEMS = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    ],
  },
  {
    section: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: "👥" },
      { label: "Disputes", href: "/admin/disputes", icon: "⚖️" },
      { label: "Payouts", href: "/admin/payouts", icon: "💰" },
      { label: "Support", href: "/admin/support", icon: "🎧" },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "⚙️" },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

const AdminSidebar = ({ isOpen, onClose, user, onLogout }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-[99] max-[900px]:block ${isOpen ? "block" : "hidden"}`}
        onClick={onClose}
      />

      <aside
        className={`w-[260px] bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex flex-col fixed top-0 left-0 h-screen z-[100] transition-transform duration-300 max-[900px]:-translate-x-full ${
          isOpen ? "!translate-x-0" : ""
        }`}
      >
        {/* Header */}
        <div className="p-[24px_20px] border-b border-white/[0.06] flex items-center gap-3">
          <img
            src="/Workvence-logo-Horizontal3.png"
            alt="Workvence"
            className="h-8 object-contain brightness-0 invert"
          />
          <span className="px-2 py-[3px] rounded-[4px] text-[10px] font-bold uppercase tracking-[1px] bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-[16px_12px] flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="text-[11px] font-semibold text-[#475569] uppercase tracking-[1px] px-3 pt-4 pb-2">
                {section.section}
              </div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 px-3.5 py-[11px] rounded-[8px] text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                    pathname === item.href
                      ? "bg-[#10b981]/[0.12] text-[#10b981] font-semibold before:content-[''] before:absolute before:left-0 before:w-[3px] before:h-[24px] before:bg-[#10b981] before:rounded-r-[4px]"
                      : "text-[#94a3b8] hover:bg-white/[0.06] hover:text-[#e2e8f0]"
                  }`}
                  onClick={onClose}
                >
                  <span className="text-[18px] shrink-0 w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer / User Info */}
        {user && (
          <div className="p-[16px_20px] border-t border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <img
                src={user.image || user.img || "/media/noavatar.png"}
                alt=""
                className="w-9 h-9 rounded-full object-cover border-2 border-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-[#e2e8f0] truncate">{user.username}</div>
                <div className="text-[12px] text-[#64748b]">Administrator</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="bg-transparent border-0 text-[#64748b] text-[18px] cursor-pointer p-1 rounded-[4px] transition-all duration-200 hover:text-[#ef4444] hover:bg-[#ef4444]/10 !p-1 !min-h-0 !h-auto"
                onClick={onLogout}
                title="Logout"
                aria-label="Logout"
              >
                🚪
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;
