"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Gavel, Loader2, MessageSquare, Search, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

interface UserRef {
  id?: string;
  email: string;
  role?: string;
  profile?: { full_name?: string };
}

interface PropertyRef {
  title: string;
  status?: string;
  owner?: UserRef;
  agent?: UserRef;
}

interface InvoiceRef {
  id: string;
  type: string;
  amount: number;
  status: string;
}

interface SaleReservationRef {
  id: string;
  amount: number;
  status: string;
  payment_reference: string;
}

interface WalletTransactionRef {
  id: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
}

interface Dispute {
  id: string;
  case_type?: string;
  category?: string;
  title?: string;
  priority?: string;
  reason: string;
  description: string;
  evidence_url?: string;
  status: string;
  response?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  opened_by?: UserRef;
  respondent?: UserRef;
  reported_user?: UserRef;
  property?: PropertyRef;
  invoice?: InvoiceRef;
  sale_reservation?: SaleReservationRef;
  wallet_transaction?: WalletTransactionRef;
}

const statuses = ["ALL", "OPEN", "RESPONDED", "UNDER_REVIEW", "RESOLVED", "REJECTED"];
const actions = [
  { value: "RESOLVED", label: "Resolve Only" },
  { value: "REJECT_DISPUTE", label: "Reject Dispute" },
  { value: "APPROVE_REFUND", label: "Approve Refund" },
  { value: "FORCE_CANCEL_RESERVATION", label: "Cancel Reservation" },
  { value: "FORCE_UNDER_REVIEW", label: "Force Under Review" },
  { value: "CONFIRM_SOLD", label: "Confirm Sold" },
];

const formatCurrency = (amount?: number) => `NGN ${Number(amount || 0).toLocaleString()}`;
const formatLabel = (value: string) => value.replaceAll("_", " ");
const nameOf = (user?: UserRef) => user?.profile?.full_name || user?.email || "Unknown";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState("RESOLVED");
  const [resolving, setResolving] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Dispute[]>(ENDPOINTS.ADMIN.DISPUTES, { search, status });
      setDisputes(data || []);
    } catch (err) {
      console.error("Failed to load disputes", err);
      toast.error("Failed to load disputes.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => queueMicrotask(fetchDisputes), 250);
    return () => window.clearTimeout(timer);
  }, [fetchDisputes]);

  const summary = useMemo(() => ({
    open: disputes.filter((item) => item.status === "OPEN").length,
    responded: disputes.filter((item) => item.status === "RESPONDED").length,
    review: disputes.filter((item) => item.status === "UNDER_REVIEW").length,
    closed: disputes.filter((item) => item.status === "RESOLVED" || item.status === "REJECTED").length,
  }), [disputes]);

  const openResolution = (dispute: Dispute) => {
    setSelected(dispute);
    setResolution("");
    setAction("RESOLVED");
  };

  const resolveDispute = async () => {
    if (!selected) return;
    if (!resolution.trim()) {
      toast.error("Resolution notes are required.");
      return;
    }

    setResolving(true);
    try {
      await api.patch(ENDPOINTS.DISPUTES.RESOLVE(selected.id), {
        action,
        status: action,
        resolution,
      });
      toast.success("Dispute resolved.");
      setSelected(null);
      await fetchDisputes();
    } catch (err) {
      console.error("Failed to resolve dispute", err);
      toast.error("Failed to resolve dispute. Check that the selected action is valid for this case.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-2xl bg-black border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Admin Resolution</p>
              <h2 className="text-2xl font-bold font-heading text-white">{selected.reason}</h2>
              <p className="text-sm text-gray-500 mt-2">{selected.property?.title || "General dispute"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Opened By</p>
                <p className="font-bold text-white">{nameOf(selected.opened_by)}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Respondent</p>
                <p className="font-bold text-white">{nameOf(selected.respondent)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <CustomSelect
                label="Resolution Action"
                value={action}
                onChange={setAction}
                options={actions.map((item) => ({ id: item.value, label: item.label }))}
                icon={<Gavel size={15} />}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Resolution Notes</label>
              <textarea value={resolution} onChange={(event) => setResolution(event.target.value)} rows={5} placeholder="Explain what the platform decided and why..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm outline-none focus:border-primary/50 resize-none" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 bg-white/5 border border-white/10 text-white px-5 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all">Cancel</button>
              <button disabled={resolving} onClick={resolveDispute} className="flex-1 bg-primary text-black px-5 py-4 rounded-2xl font-black hover:bg-primary-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {resolving ? <Loader2 className="animate-spin" size={18} /> : <Gavel size={18} />}
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Dispute Center</h1>
          <p className="text-gray-500 font-light">Review scam reports, payment disagreements, failed handovers, document issues, and refund requests.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reason, property, user..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary/50" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {statuses.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Open", value: summary.open, icon: AlertTriangle, color: "text-red-500" },
          { label: "Responded", value: summary.responded, icon: MessageSquare, color: "text-primary" },
          { label: "Under Review", value: summary.review, icon: ShieldCheck, color: "text-blue-500" },
          { label: "Closed", value: summary.closed, icon: CheckCircle2, color: "text-green-500" },
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{dispute.property?.title || "Platform case"}</p>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{dispute.case_type || "DISPUTE"}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{dispute.title || dispute.reason}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mt-3 line-clamp-3">{dispute.description}</p>
                </div>
                <span className={cn("shrink-0 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", dispute.status === "RESOLVED" ? "bg-green-500/10 text-green-500" : dispute.status === "REJECTED" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>
                  {formatLabel(dispute.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Opened By</p>
                  <p className="text-sm font-bold text-white mt-2">{nameOf(dispute.opened_by)}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Respondent</p>
                  <p className="text-sm font-bold text-white mt-2">{nameOf(dispute.reported_user || dispute.respondent)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-500">
                <span>Category: {formatLabel(dispute.category || "GENERAL")}</span>
                <span>Priority: {formatLabel(dispute.priority || "MEDIUM")}</span>
                <span>Evidence: {dispute.evidence_url ? <a href={dispute.evidence_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a> : "N/A"}</span>
                <span>Invoice: {dispute.invoice ? `${dispute.invoice.type} ${formatCurrency(dispute.invoice.amount)}` : "N/A"}</span>
                <span>Reservation: {dispute.sale_reservation?.status || "N/A"}</span>
                <span>Transaction: {dispute.wallet_transaction?.reference || "N/A"}</span>
              </div>

              {dispute.response && (
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Respondent Reply</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{dispute.response}</p>
                </div>
              )}

              {dispute.resolution && (
                <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4">
                  <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mb-2">Platform Resolution</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{dispute.resolution}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{new Date(dispute.created_at).toLocaleString()}</p>
                {dispute.status !== "RESOLVED" && dispute.status !== "REJECTED" ? (
                  <button onClick={() => openResolution(dispute)} className="bg-primary text-black px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                    <Gavel size={15} />
                    Resolve Case
                  </button>
                ) : (
                  <div className="text-green-500 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    Case closed
                  </div>
                )}
              </div>
            </div>
          ))}
          {disputes.length === 0 && (
            <div className="xl:col-span-2 py-24 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
              <XCircle className="mx-auto text-gray-700 mb-4" size={34} />
              <p className="text-gray-500 font-light italic">No disputes match your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
