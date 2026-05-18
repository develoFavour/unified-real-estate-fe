"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Building2,
  Wrench,
  Wallet,
  Settings,
  LogOut,
  Briefcase,
  Search,
  FileText,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useAuthStore } from "@/store/useAuthStore";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const role = user?.role || Cookies.get("user_role");

  const getNavItems = () => {
    switch (role) {
      case "OWNER":
        return [
          { label: "Overview", icon: LayoutDashboard, href: "/owner" },
          { label: "My Assets", icon: Building2, href: "/owner/properties" },
          { label: "Recruit Agents", icon: Briefcase, href: "/owner/agents" },
          { label: "Leases", icon: FileText, href: "/owner/leases" },
          { label: "Messages", icon: MessageSquare, href: "/messages" },
          { label: "Maintenance", icon: Wrench, href: "/owner/maintenance" },
          { label: "Revenue", icon: Wallet, href: "/owner/payments" },
        ];
      case "AGENT":
        return [
          { label: "Command Center", icon: LayoutDashboard, href: "/agent" },
          { label: "My Mandates", icon: Building2, href: "/agent/mandates" },
          { label: "Leases", icon: FileText, href: "/agent/leases" },
          { label: "Messages", icon: MessageSquare, href: "/messages" },
          { label: "Work Orders", icon: Wrench, href: "/agent/maintenance" },
          { label: "Earnings", icon: Wallet, href: "/agent/payments" },
        ];
      case "TENANT":
        return [
          { label: "Home Hub", icon: LayoutDashboard, href: "/tenant" },
          { label: "Leases", icon: FileText, href: "/tenant/leases" },
          { label: "Owned Properties", icon: Building2, href: "/tenant/owned" },
          { label: "Messages", icon: MessageSquare, href: "/messages" },
          { label: "Maintenance", icon: Wrench, href: "/tenant/maintenance" },
          { label: "Payments", icon: Wallet, href: "/tenant/payments" },
          { label: "Savings Wallet", icon: Wallet, href: "/tenant/wallet" },
          { label: "Find a Home", icon: Search, href: "/properties" },
        ];
      default:
        return [
          { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
          { label: "Messages", icon: MessageSquare, href: "/messages" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={cn("w-72 bg-[#050505] border-r border-white/5 h-dvh flex flex-col z-50", className)}>
      <div className="p-6 lg:p-8">
        <Logo />
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Management</p>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/owner" && item.href !== "/agent" && item.href !== "/tenant" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-black" : "text-gray-500 group-hover:text-primary"
              )} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-white/5 space-y-2">
        <Link
          href={role === "TENANT" ? "/tenant/settings" : "/settings"}
          onClick={onNavigate}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
        >
          <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
          <span className="text-sm font-bold">Settings</span>
        </Link>
        <button
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
