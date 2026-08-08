// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  user: any;
  onLogout: () => void;
}

const AdminSidebar = ({ isOpen, onClose, user, onLogout }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <img
            src="/Workvence-logo-Horizontal 1.png"
            alt="Workvence"
            className="brand-logo"
          />
          <span className="admin-badge">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${pathname === item.href ? "active" : ""}`}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer / User Info */}
        {user && (
          <div className="sidebar-footer">
            <div className="user-info">
              <img
                src={user.image || user.img || "/media/noavatar.png"}
                alt=""
                className="user-avatar"
              />
              <div className="user-details">
                <div className="user-name">{user.username}</div>
                <div className="user-role">Administrator</div>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                🚪
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;
