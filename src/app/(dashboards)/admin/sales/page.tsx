"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Search, ShieldCheck, Wallet } from "lucide-react";
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
  status?: string;
  owner?: UserRef;
  agent?: UserRef;
}

interface SaleReservation {
  id: string;
  amount: number;
  status: string;
  payment_reference: string;
  buyer_accepted_at?: string | null;
  final_settlement_amount: number;
  final_settlement_reference?: string;
  final_settlement_date?: string | null;
  created_at: string;
  buyer?: UserRef;
  property?: PropertyRef;
  documents?: unknown[];
}

interface Dispute {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  opened_by?: UserRef;
  property?: PropertyRef;
}

interface SaleWorkflowResponse {
  reservations: SaleReservation[];
  disputes: Dispute[];
}

const statuses = ["ALL", "RESERVED", "UNDER_REVIEW", "ACCEPTED", "DISPUTED", "CANCELLED", "EXPIRED", "REFUNDED", "SOLD"];
const formatCurrency = (amount: number) => `NGN ${Number(amount || 0).toLocaleString()}`;
const nameOf = (user?: UserRef) => user?.profile?.full_name || user?.email || "Unknown";
const formatLabel = (value: string) => value.replaceAll("_", " ");

const getCompletion = (reservation: SaleReservation) => {
  let done = 0;
  if (reservation.payment_reference) done += 1;
  if ((reservation.documents?.length || 0) > 0) done += 1;
  if (reservation.buyer_accepted_at) done += 1;
  if (reservation.final_settlement_reference || reservation.final_settlement_date || reservation.final_settlement_amount > 0) done += 1;
  if (reservation.status === "SOLD") done += 1;
  return done;
};

export default function AdminSalesPage() {
  const [data, setData] = useState<SaleWorkflowResponse>({ reservations: [], disputes: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<SaleWorkflowResponse>(ENDPOINTS.ADMIN.SALES, { search, status });
      setData({
        reservations: res.reservations || [],
        disputes: res.disputes || [],
      });
    } catch (err) {
      console.error("Failed to load sale workflow", err);
      toast.error("Failed to load sale workflow.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => queueMicrotask(fetchData), 250);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const summary = useMemo(() => ({
    reserved: data.reservations.filter((item) => item.status === "RESERVED").length,
    review: data.reservations.filter((item) => item.status === "UNDER_REVIEW" || item.status === "ACCEPTED").length,
    sold: data.reservations.filter((item) => item.status === "SOLD").length,
    disputes: data.disputes.filter((item) => item.status !== "RESOLVED" && item.status !== "REJECTED").length,
  }), [data]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Sale Workflow Monitor</h1>
          <p className="text-gray-500 font-light">Track reservations, sale documents, buyer review, final settlement, disputes, and sold confirmation.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search property, buyer, reference..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary/50" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {statuses.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Reserved", value: summary.reserved, icon: Wallet, color: "text-primary" },
          { label: "Under Review", value: summary.review, icon: FileText, color: "text-blue-500" },
          { label: "Sold", value: summary.sold, icon: CheckCircle2, color: "text-green-500" },
          { label: "Open Disputes", value: summary.disputes, icon: AlertTriangle, color: "text-red-500" },
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <section className="xl:col-span-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading">Sale Reservations</h2>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{data.reservations.length} loaded</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.reservations.map((reservation) => {
                const complete = getCompletion(reservation);
                return (
                  <div key={reservation.id} className="p-6 space-y-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white">{reservation.property?.title || "Sale property"}</h3>
                        <p className="text-xs text-gray-500 mt-1">Buyer: {nameOf(reservation.buyer)} · {formatCurrency(reservation.amount)}</p>
                      </div>
                      <span className={cn("w-fit text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", reservation.status === "SOLD" ? "bg-green-500/10 text-green-500" : reservation.status === "DISPUTED" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>
                        {formatLabel(reservation.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: "Deposit", done: Boolean(reservation.payment_reference) },
                        { label: "Docs", done: (reservation.documents?.length || 0) > 0 },
                        { label: "Buyer Review", done: Boolean(reservation.buyer_accepted_at) },
                        { label: "Settlement", done: Boolean(reservation.final_settlement_reference || reservation.final_settlement_date || reservation.final_settlement_amount > 0) },
                        { label: "Sold", done: reservation.status === "SOLD" },
                      ].map((step) => (
                        <div key={step.label} className={cn("rounded-2xl border p-3", step.done ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-white/5 border-white/10 text-gray-500")}>
                          <p className="text-[10px] font-black uppercase tracking-widest">{step.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      <span>Reference: {reservation.payment_reference}</span>
                      <span>{complete}/5 complete</span>
                      <span>{new Date(reservation.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
              {data.reservations.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No sale reservations match your filters.</p>}
            </div>
          </section>

          <section className="xl:col-span-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading">Sale Disputes</h2>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{data.disputes.length}</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.disputes.map((dispute) => (
                <div key={dispute.id} className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{dispute.reason}</h3>
                      <p className="text-xs text-gray-500 mt-1">{dispute.property?.title || "Sale property"}</p>
                    </div>
                    <ShieldCheck size={16} className="text-primary shrink-0" />
                  </div>
                  <span className={cn("inline-flex text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", dispute.status === "RESOLVED" ? "bg-green-500/10 text-green-500" : dispute.status === "REJECTED" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>
                    {formatLabel(dispute.status)}
                  </span>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{new Date(dispute.created_at).toLocaleDateString()}</p>
                </div>
              ))}
              {data.disputes.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No sale disputes found.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
