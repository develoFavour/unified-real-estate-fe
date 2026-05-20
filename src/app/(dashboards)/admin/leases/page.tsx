"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, FileText, Loader2, ReceiptText, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";

interface UserRef {
  email: string;
  profile?: { full_name?: string };
}

interface PropertyRef {
  title: string;
  address?: string;
  city?: string;
  state?: string;
  owner?: UserRef;
  agent?: UserRef;
}

interface LeaseRequest {
  id: string;
  status: string;
  created_at: string;
  reviewed_at?: string | null;
  property?: PropertyRef;
  tenant?: UserRef;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  paid_at?: string | null;
  due_date?: string | null;
  property?: PropertyRef;
  tenant?: UserRef;
  lease?: {
    status: string;
    tenant_accepted?: boolean;
    documents?: unknown[];
  };
}

interface Lease {
  id: string;
  status: string;
  rent_amount: number;
  tenant_accepted: boolean;
  start_date: string;
  end_date: string;
  property?: PropertyRef;
  tenant?: UserRef;
  documents?: unknown[];
}

interface LeaseWorkflowResponse {
  lease_requests: LeaseRequest[];
  rent_invoices: Invoice[];
  leases: Lease[];
}

const statuses = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const formatCurrency = (amount: number) => `NGN ${Number(amount || 0).toLocaleString()}`;
const nameOf = (user?: UserRef) => user?.profile?.full_name || user?.email || "Unknown";
const formatLabel = (value: string) => value.replaceAll("_", " ");

export default function AdminLeasesPage() {
  const [data, setData] = useState<LeaseWorkflowResponse>({ lease_requests: [], rent_invoices: [], leases: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<LeaseWorkflowResponse>(ENDPOINTS.ADMIN.LEASES, { search, status });
      setData({
        lease_requests: res.lease_requests || [],
        rent_invoices: res.rent_invoices || [],
        leases: res.leases || [],
      });
    } catch (err) {
      console.error("Failed to load lease workflow", err);
      toast.error("Failed to load lease workflow.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => queueMicrotask(fetchData), 250);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const summary = useMemo(() => ({
    pending: data.lease_requests.filter((item) => item.status === "PENDING").length,
    approved: data.lease_requests.filter((item) => item.status === "APPROVED").length,
    unpaid: data.rent_invoices.filter((item) => item.status === "PENDING" || item.status === "OVERDUE").length,
    active: data.leases.filter((item) => item.status === "ACTIVE").length,
  }), [data]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Lease Workflow Monitor</h1>
          <p className="text-gray-500 font-light">Track lease requests, rent invoices, document handover, and tenant acknowledgement.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search property or tenant..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary/50" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {statuses.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Pending Requests", value: summary.pending, icon: Clock, color: "text-orange-500" },
          { label: "Approved Requests", value: summary.approved, icon: CheckCircle2, color: "text-green-500" },
          { label: "Unpaid Rent Invoices", value: summary.unpaid, icon: ReceiptText, color: "text-primary" },
          { label: "Active Leases", value: summary.active, icon: FileText, color: "text-blue-500" },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.03] border border-white/5 p-5 rounded-[2rem]">
            <div className={cn("w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center mb-4", item.color)}>
              <item.icon size={18} />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.label}</p>
            <p className="text-2xl font-bold font-heading text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading">Lease Requests</h2>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{data.lease_requests.length} loaded</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.lease_requests.map((request) => (
                <div key={request.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white">{request.property?.title || "Property"}</h3>
                      <p className="text-xs text-gray-500 mt-1">Tenant: {nameOf(request.tenant)}</p>
                    </div>
                    <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", request.status === "APPROVED" ? "bg-green-500/10 text-green-500" : request.status === "REJECTED" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Requested {new Date(request.created_at).toLocaleDateString()}</p>
                </div>
              ))}
              {data.lease_requests.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No lease requests match your filters.</p>}
            </div>
          </section>

          <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading">Rent Invoices</h2>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{data.rent_invoices.length} loaded</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.rent_invoices.map((invoice) => (
                <div key={invoice.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white">{invoice.property?.title || "Property"}</h3>
                      <p className="text-xs text-gray-500 mt-1">{nameOf(invoice.tenant)} · {formatCurrency(invoice.amount)}</p>
                    </div>
                    <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", invoice.status === "PAID" ? "bg-green-500/10 text-green-500" : invoice.status === "OVERDUE" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[10px] uppercase tracking-widest font-black text-gray-500">
                    <span>Lease: {invoice.lease?.status || "Not created"}</span>
                    <span>Docs: {invoice.lease?.documents?.length || 0}</span>
                    <span>Ack: {invoice.lease?.tenant_accepted ? "Yes" : "No"}</span>
                  </div>
                </div>
              ))}
              {data.rent_invoices.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No rent invoices found.</p>}
            </div>
          </section>

          <section className="xl:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading">Active And Pending Leases</h2>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{data.leases.length} records</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {data.leases.map((lease) => (
                <div key={lease.id} className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white">{lease.property?.title || "Lease property"}</h3>
                      <p className="text-xs text-gray-500 mt-1">{nameOf(lease.tenant)}</p>
                    </div>
                    <span className={cn("h-fit text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", lease.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary")}>{lease.status}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
                    <span>{formatCurrency(lease.rent_amount)}</span>
                    <span>{new Date(lease.start_date).toLocaleDateString()}</span>
                    <span>{new Date(lease.end_date).toLocaleDateString()}</span>
                    <span>{lease.documents?.length || 0} docs</span>
                  </div>
                </div>
              ))}
              {data.leases.length === 0 && <p className="p-10 text-center text-sm text-gray-500 lg:col-span-2">No leases found.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
