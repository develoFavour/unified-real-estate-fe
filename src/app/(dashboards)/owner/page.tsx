"use client";

import { useEffect, useState } from "react";
import { 
  Home, 
  Users, 
  Wallet, 
  Wrench, 
  ArrowUpRight, 
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SaleReservationsPanel } from "@/components/workflows/sale-reservations-panel";

interface DashboardSummary {
  total_properties: number;
  occupied_properties: number;
  total_revenue: number;
  pending_maintenance: number;
  recent_payments: {
    amount: number;
    payment_reference: string;
    payment_date: string;
  }[];
  maintenance: {
    title: string;
    description: string;
    priority: string;
    status: string;
  }[];
}

interface LeaseRequest {
  id: string;
  status: string;
  message?: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
    location?: string;
  };
  tenant?: {
    email?: string;
    profile?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

interface Invoice {
  id: string;
  tenant_id: string;
  property_id: string;
  lease_id?: string | null;
  amount: number;
  type: string;
  status: string;
  paid_at?: string | null;
  due_date?: string | null;
  payment_reference?: string;
  property?: {
    title?: string;
  };
  tenant?: {
    email?: string;
    profile?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

const getTenantName = (tenant?: LeaseRequest["tenant"] | Invoice["tenant"]) => {
  const name = [tenant?.profile?.first_name, tenant?.profile?.last_name].filter(Boolean).join(" ");
  return name || tenant?.email || "Tenant";
};

export default function OwnerDashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [summaryRes, requestRes, invoiceRes] = await Promise.allSettled([
          api.get<DashboardSummary>(ENDPOINTS.PROPERTIES.DASHBOARD_SUMMARY),
          api.get<LeaseRequest[]>("/lease-requests/incoming"),
          api.get<Invoice[]>("/invoices/incoming"),
        ]);

        if (summaryRes.status === "fulfilled") {
          setSummary(summaryRes.value);
        }
        if (requestRes.status === "fulfilled") {
          setLeaseRequests(requestRes.value || []);
        }
        if (invoiceRes.status === "fulfilled") {
          setInvoices(invoiceRes.value || []);
        }
      } catch (err) {
        console.error("Failed to fetch summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 w-1/3 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-[2rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white/5 rounded-[3rem]" />
          <div className="h-96 bg-white/5 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Assets", value: summary?.total_properties || 0, icon: <Home size={20} />, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Occupancy Rate", value: `${summary?.total_properties ? Math.round((summary.occupied_properties / summary.total_properties) * 100) : 0}%`, icon: <Users size={20} />, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Revenue", value: formatCurrency(summary?.total_revenue || 0), icon: <Wallet size={20} />, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending Tasks", value: summary?.pending_maintenance || 0, icon: <Wrench size={20} />, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];
  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID").slice(0, 4);
  const openInvoices = invoices.filter((invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE");
  const paidTotal = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Portfolio Summary</h1>
          <p className="text-gray-500 font-light">Here&apos;s how your real estate investments are performing today.</p>
        </div>
        <Link 
          href="/owner/properties/new"
          className="bg-primary text-black px-8 py-4 rounded-2xl font-bold shadow-[0_10px_30px_rgba(193,155,118,0.2)] hover:bg-primary-hover transition-all flex items-center gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
          New Listing
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 group hover:bg-white/[0.04] transition-all">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link href="/owner/leases" className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 group hover:bg-white/[0.04] transition-all">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText size={20} />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{leaseRequests.length} pending</span>
          </div>
          <h3 className="font-bold text-white">Lease Management</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">Review tenant requests and upload lease or handover documents.</p>
          <span className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:gap-3 transition-all">
            Manage leases <ArrowUpRight size={14} />
          </span>
        </Link>

        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Wallet size={18} className="text-green-500" />
              Paid Rent Invoices
            </h3>
            <Link href="/owner/payments" className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-hover transition-colors">
              {openInvoices.length} open
            </Link>
          </div>
          <div className="p-2">
            {paidInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-4 p-6 hover:bg-white/[0.02] rounded-3xl transition-all">
                <div>
                  <p className="text-sm font-bold text-white">{invoice.property?.title || "Property invoice"}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">
                    {getTenantName(invoice.tenant)} • {invoice.type.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-500">{formatCurrency(invoice.amount)}</p>
                  <p className="text-[10px] text-gray-500 font-bold">
                    {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : "Paid"}
                  </p>
                </div>
              </div>
            ))}
            {paidInvoices.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-gray-500 text-sm font-light italic">Paid rent invoices will appear here after tenants pay.</p>
              </div>
            )}
            {paidInvoices.length > 0 && (
              <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recent total</p>
                <p className="text-sm font-bold text-green-500">{formatCurrency(paidTotal)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SaleReservationsPanel mode="stakeholder" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Payments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Recent Revenue
              </h3>
              <Link href="/owner/income" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>
            <div className="p-2">
              {summary?.recent_payments.slice(0, 5).map((pay, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-white/[0.02] rounded-3xl transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <ArrowUpRight size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Rental Payment Received</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Ref: #{pay.payment_reference.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(pay.amount)}</p>
                    <p className="text-[10px] text-gray-500 font-bold">{new Date(pay.payment_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {(!summary?.recent_payments || summary.recent_payments.length === 0) && (
                <div className="p-10 text-center">
                  <p className="text-gray-500 text-sm font-light italic">No recent transactions recorded.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 flex flex-col justify-between group cursor-pointer hover:bg-primary/10 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Manage Agents</h4>
                  <p className="text-xs text-gray-500 font-light mt-1">Review your active management team and invitations.</p>
                </div>
              </div>
              <Link href="/owner/agents" className="mt-8 text-xs font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                Access Team Dashboard <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between group cursor-pointer hover:bg-white/[0.04] transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Property Health</h4>
                  <p className="text-xs text-gray-500 font-light mt-1">Check vacancy status and maintenance ticket resolution.</p>
                </div>
              </div>
              <Link href="/owner/properties" className="mt-8 text-xs font-bold text-white flex items-center gap-2 group-hover:gap-3 transition-all opacity-60 group-hover:opacity-100">
                View Portfolio <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Urgent Maintenance */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-8 flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Wrench size={18} className="text-orange-400" />
              Maintenance Alerts
            </h3>
            <span className={cn(
              "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
              summary?.pending_maintenance ? "bg-orange-500/10 text-orange-500 animate-pulse" : "bg-green-500/10 text-green-500"
            )}>
              {summary?.pending_maintenance ? "Action Required" : "System Clear"}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {summary?.maintenance.filter(m => m.status === "PENDING").slice(0, 4).map((m, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-orange-500/20 transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{m.title}</h4>
                  <span className={cn(
                    "text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter",
                    m.priority === "URGENT" ? "bg-red-500/20 text-red-500" : "bg-white/10 text-gray-400"
                  )}>
                    {m.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-light line-clamp-2 mb-4 leading-relaxed">{m.description}</p>
                <Link href="/owner/maintenance" className="text-[10px] font-bold text-orange-400 hover:underline">Resolve Request</Link>
              </div>
            ))}
            {(!summary?.maintenance || summary.maintenance.filter(m => m.status === "PENDING").length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-sm text-gray-500 font-light italic">No pending maintenance tasks.</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-3xl flex items-center gap-4">
            <AlertCircle size={20} className="text-orange-500 shrink-0" />
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              Timely maintenance increases property value and improves tenant retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
