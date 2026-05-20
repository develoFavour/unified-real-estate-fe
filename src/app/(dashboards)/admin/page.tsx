"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  FileClock,
  Loader2,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";

interface AuditEvent {
  id: string;
  entity_type: string;
  action: string;
  created_at: string;
  actor?: {
    email: string;
    profile?: {
      full_name?: string;
    };
  };
}

interface AdminSummary {
  total_users: number;
  pending_agents: number;
  total_properties: number;
  active_leases: number;
  open_disputes: number;
  open_maintenance: number;
  payment_volume: number;
  role_counts: Record<string, number>;
  property_status_counts: Record<string, number>;
  recent_activity: AuditEvent[];
}

const formatCurrency = (amount: number) => `NGN ${Number(amount || 0).toLocaleString()}`;

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminSummary>(ENDPOINTS.ADMIN.SUMMARY)
      .then(setSummary)
      .catch((err) => console.error("Failed to load admin summary", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => [
    {
      label: "Total Users",
      value: summary?.total_users ?? 0,
      sub: `${summary?.role_counts?.TENANT ?? 0} tenants`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/admin/users",
    },
    {
      label: "Properties",
      value: summary?.total_properties ?? 0,
      sub: `${summary?.property_status_counts?.AVAILABLE ?? 0} available`,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/admin/properties",
    },
    {
      label: "Payment Volume",
      value: formatCurrency(summary?.payment_volume ?? 0),
      sub: "Successful inflow and payments",
      icon: Wallet,
      color: "text-green-500",
      bg: "bg-green-500/10",
      href: "/admin/reports",
    },
    {
      label: "Pending Agents",
      value: summary?.pending_agents ?? 0,
      sub: "Need approval review",
      icon: FileClock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      href: "/admin/approvals",
    },
  ], [summary]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Admin Command Center</h1>
          <p className="text-gray-500 font-light">Monitor trust, users, listings, payments, disputes, and platform operations.</p>
        </div>
        <Link href="/admin/approvals" className="bg-primary text-black px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all">
          Review Approvals
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] space-y-6 hover:bg-white/[0.05] transition-all group">
            <div className="flex justify-between items-start">
              <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight size={18} className="text-gray-600 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold font-heading mt-1">{stat.value}</h3>
              <p className="text-xs text-gray-600 mt-2">{stat.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Active Leases", value: summary?.active_leases ?? 0, icon: ShieldCheck, color: "text-green-500" },
            { label: "Open Disputes", value: summary?.open_disputes ?? 0, icon: AlertTriangle, color: "text-red-500" },
            { label: "Open Maintenance", value: summary?.open_maintenance ?? 0, icon: Wrench, color: "text-primary" },
            { label: "Sold Properties", value: summary?.property_status_counts?.SOLD ?? 0, icon: Building2, color: "text-blue-500" },
          ].map((item) => (
            <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
              <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-5", item.color)}>
                <item.icon size={20} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold font-heading mt-2 text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[560px]">
          <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
            <h3 className="text-xl font-bold font-heading">Recent Platform Activity</h3>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{summary?.recent_activity?.length ?? 0} events</span>
          </div>
          <div className="divide-y divide-white/5 overflow-y-auto min-h-0">
            {(summary?.recent_activity || []).map((activity) => (
              <div key={activity.id} className="p-6 flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-primary mt-2 shadow-[0_0_16px_rgba(193,155,118,0.45)]" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{activity.action.replaceAll("_", " ")}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.entity_type} event by {activity.actor?.profile?.full_name || activity.actor?.email || "System"}
                  </p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!summary?.recent_activity || summary.recent_activity.length === 0) && (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-sm">No audit activity has been recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
