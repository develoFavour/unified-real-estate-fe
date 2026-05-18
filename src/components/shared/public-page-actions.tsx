"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { Home, LayoutDashboard, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const dashboardPathByRole: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  OWNER: "/owner",
  AGENT: "/agent",
  TENANT: "/tenant",
};

export function getDashboardPath(role?: string | null) {
  return role ? dashboardPathByRole[role] || "/" : "/";
}

export function PublicPageActions() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const token = Cookies.get("token");
  const role = user?.role || Cookies.get("user_role");
  const isLoggedIn = Boolean(token || user);
  const dashboardHref = isLoggedIn ? getDashboardPath(role) : `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-300 transition hover:border-primary/40 hover:text-primary"
      >
        <Home size={15} />
        Home
      </Link>
      <Link
        href={dashboardHref}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-primary-hover"
      >
        {isLoggedIn ? <LayoutDashboard size={15} /> : <LogIn size={15} />}
        {isLoggedIn ? "Dashboard" : "Sign In"}
      </Link>
    </div>
  );
}
