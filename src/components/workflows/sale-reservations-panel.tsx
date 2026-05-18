"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, ShieldCheck, Upload } from "lucide-react";
import { api } from "@/lib/api/methods";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CustomSelect } from "@/components/ui/custom-select";

type PanelMode = "buyer" | "stakeholder";

interface TransactionDocument {
  id: string;
  title: string;
  type: string;
  document_url: string;
  created_at: string;
}

interface SaleReservation {
  id: string;
  amount: number;
  status: string;
  payment_reference: string;
  expires_at?: string | null;
  buyer_accepted_at?: string | null;
  final_settlement_amount?: number;
  final_settlement_reference?: string;
  property?: {
    id: string;
    title: string;
  };
  buyer?: {
    email?: string;
    profile?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
    };
  };
  documents?: TransactionDocument[];
}

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

const getBuyerName = (reservation: SaleReservation) => {
  const profile = reservation.buyer?.profile;
  const name = profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  return name || reservation.buyer?.email || "Buyer";
};

const SALE_DOCUMENT_TYPE_OPTIONS = [
  { id: "TITLE_DOCUMENT", label: "Title Document" },
  { id: "OWNERSHIP_PROOF", label: "Ownership Proof" },
  { id: "SALE_AGREEMENT", label: "Sale Agreement" },
  { id: "LEGAL_DOCUMENT", label: "Legal Document" },
  { id: "OTHER", label: "Other" },
];

export function SaleReservationsPanel({ mode }: { mode: PanelMode }) {
  const [reservations, setReservations] = useState<SaleReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [documentForms, setDocumentForms] = useState<Record<string, { title: string; type: string; document_url: string }>>({});
  const [settlementForms, setSettlementForms] = useState<Record<string, { amount: string; reference: string; notes: string }>>({});
  const [disputeForms, setDisputeForms] = useState<Record<string, { reason: string; description: string }>>({});

  const fetchReservations = useCallback(async () => {
    const endpoint = mode === "buyer" ? "/sale-reservations/mine" : "/sale-reservations/incoming";
    const data = await api.get<SaleReservation[]>(endpoint);
    setReservations(data || []);
  }, [mode]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchReservations()
        .catch((err) => console.error("Failed to fetch sale reservations", err))
        .finally(() => setLoading(false));
    });
  }, [fetchReservations]);

  const uploadDocument = async (reservation: SaleReservation) => {
    const form = documentForms[reservation.id];
    if (!form?.title || !form?.document_url) {
      toast.error("Document title and URL are required.");
      return;
    }
    setActiveId(reservation.id);
    try {
      await api.post("/transaction-documents", {
        sale_reservation_id: reservation.id,
        title: form.title,
        type: form.type || "LEGAL_DOCUMENT",
        document_url: form.document_url,
      });
      setDocumentForms((current) => ({ ...current, [reservation.id]: { title: "", type: "LEGAL_DOCUMENT", document_url: "" } }));
      await fetchReservations();
      toast.success("Sale document attached.");
    } catch (err) {
      console.error("Failed to upload document", err);
      toast.error("Failed to attach document.");
    } finally {
      setActiveId(null);
    }
  };

  const uploadDocumentFile = async (reservationId: string, file?: File) => {
    if (!file) return;

    setUploadingForId(reservationId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<{ url: string }>("/upload/document", formData);
      setDocumentForms((current) => ({
        ...current,
        [reservationId]: {
          ...(current[reservationId] || { title: "", type: "LEGAL_DOCUMENT", document_url: "" }),
          title: current[reservationId]?.title || file.name,
          document_url: res.url,
        },
      }));
      toast.success("Document uploaded to Cloudinary.");
    } catch (err) {
      console.error("Failed to upload document file", err);
      toast.error("Document upload failed.");
    } finally {
      setUploadingForId(null);
    }
  };

  const acceptDocuments = async (reservation: SaleReservation) => {
    setActiveId(reservation.id);
    try {
      await api.post(`/sale-reservations/${reservation.id}/accept-documents`, {});
      await fetchReservations();
      toast.success("Sale documents accepted.");
    } catch (err) {
      console.error("Failed to accept documents", err);
      toast.error("Unable to accept documents.");
    } finally {
      setActiveId(null);
    }
  };

  const recordSettlement = async (reservation: SaleReservation) => {
    const form = settlementForms[reservation.id];
    const amount = Number(form?.amount);
    if (!amount || !form?.reference) {
      toast.error("Settlement amount and reference are required.");
      return;
    }
    setActiveId(reservation.id);
    try {
      await api.post(`/sale-reservations/${reservation.id}/settlement`, {
        amount,
        reference: form.reference,
        notes: form.notes,
      });
      await fetchReservations();
      toast.success("Final settlement recorded. Property marked sold.");
    } catch (err) {
      console.error("Failed to record settlement", err);
      toast.error("Settlement could not be recorded.");
    } finally {
      setActiveId(null);
    }
  };

  const openDispute = async (reservation: SaleReservation) => {
    const form = disputeForms[reservation.id];
    if (!form?.reason || !form?.description) {
      toast.error("Dispute reason and description are required.");
      return;
    }
    setActiveId(reservation.id);
    try {
      await api.post("/disputes", {
        sale_reservation_id: reservation.id,
        reason: form.reason,
        description: form.description,
      });
      setDisputeForms((current) => ({ ...current, [reservation.id]: { reason: "", description: "" } }));
      await fetchReservations();
      toast.success("Dispute opened.");
    } catch (err) {
      console.error("Failed to open dispute", err);
      toast.error("Unable to open dispute.");
    } finally {
      setActiveId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 animate-pulse h-48" />
    );
  }

  if (reservations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Sale Protection
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {mode === "buyer" ? "Review documents, accept evidence, or open a dispute." : "Upload sale evidence and record final settlement when conditions are met."}
          </p>
        </div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{reservations.length} active</span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {reservations.slice(0, 4).map((reservation) => {
          const documentForm = documentForms[reservation.id] || { title: "", type: "LEGAL_DOCUMENT", document_url: "" };
          const settlementForm = settlementForms[reservation.id] || { amount: "", reference: "", notes: "" };
          const disputeForm = disputeForms[reservation.id] || { reason: "", description: "" };
          const busy = activeId === reservation.id;

          return (
            <div key={reservation.id} className="p-5 rounded-[2rem] border border-white/5 bg-black/20 space-y-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">{reservation.property?.title || "Sale property"}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">
                    {mode === "buyer" ? reservation.payment_reference : `${getBuyerName(reservation)} - ${reservation.payment_reference}`}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-bold text-primary">{formatCurrency(reservation.amount)}</p>
                  <span className={cn(
                    "inline-flex mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    reservation.status === "DISPUTED" ? "bg-red-500/10 text-red-500" :
                    reservation.status === "SOLD" ? "bg-green-500/10 text-green-500" :
                    "bg-primary/10 text-primary"
                  )}>
                    {reservation.status}
                  </span>
                </div>
              </div>

              {(reservation.documents?.length || 0) > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reservation.documents?.slice(0, 4).map((document) => (
                    <a
                      key={document.id}
                      href={document.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
                    >
                      <FileText size={16} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">{document.title}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{document.type.replaceAll("_", " ")}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {mode === "stakeholder" && reservation.status !== "SOLD" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <input
                    value={documentForm.title}
                    onChange={(event) => setDocumentForms((current) => ({ ...current, [reservation.id]: { ...documentForm, title: event.target.value } }))}
                    placeholder="Document title"
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
                  />
                  <CustomSelect
                    value={documentForm.type}
                    onChange={(value) => setDocumentForms((current) => ({ ...current, [reservation.id]: { ...documentForm, type: value } }))}
                    options={SALE_DOCUMENT_TYPE_OPTIONS}
                    icon={<FileText size={15} />}
                  />
                  <label className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none cursor-pointer flex items-center justify-center gap-2 hover:border-primary/30 transition-colors">
                    {uploadingForId === reservation.id ? <Loader2 size={14} className="animate-spin text-primary" /> : <Upload size={14} className="text-primary" />}
                    <span className="truncate">{documentForm.document_url ? "Uploaded" : "Choose File"}</span>
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(event) => uploadDocumentFile(reservation.id, event.target.files?.[0])}
                    />
                  </label>
                  <button
                    onClick={() => uploadDocument(reservation)}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-60"
                  >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    Attach
                  </button>
                </div>
              )}

              {mode === "buyer" && reservation.status !== "SOLD" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <button
                    onClick={() => acceptDocuments(reservation)}
                    disabled={busy || !reservation.documents?.length || Boolean(reservation.buyer_accepted_at)}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-black px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {reservation.buyer_accepted_at ? "Documents Accepted" : "Accept Documents"}
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      value={disputeForm.reason}
                      onChange={(event) => setDisputeForms((current) => ({ ...current, [reservation.id]: { ...disputeForm, reason: event.target.value } }))}
                      placeholder="Reason"
                      className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
                    />
                    <input
                      value={disputeForm.description}
                      onChange={(event) => setDisputeForms((current) => ({ ...current, [reservation.id]: { ...disputeForm, description: event.target.value } }))}
                      placeholder="What happened?"
                      className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
                    />
                    <button
                      onClick={() => openDispute(reservation)}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-60"
                    >
                      <AlertCircle size={14} />
                      Dispute
                    </button>
                  </div>
                </div>
              )}

              {mode === "stakeholder" && reservation.status !== "SOLD" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 pt-4 border-t border-white/5">
                  <input
                    value={settlementForm.amount}
                    onChange={(event) => setSettlementForms((current) => ({ ...current, [reservation.id]: { ...settlementForm, amount: event.target.value } }))}
                    placeholder="Final amount"
                    type="number"
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
                  />
                  <input
                    value={settlementForm.reference}
                    onChange={(event) => setSettlementForms((current) => ({ ...current, [reservation.id]: { ...settlementForm, reference: event.target.value } }))}
                    placeholder="Settlement reference"
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
                  />
                  <input
                    value={settlementForm.notes}
                    onChange={(event) => setSettlementForms((current) => ({ ...current, [reservation.id]: { ...settlementForm, notes: event.target.value } }))}
                    placeholder="Notes"
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
                  />
                  <button
                    onClick={() => recordSettlement(reservation)}
                    disabled={busy || !reservation.documents?.length || !reservation.buyer_accepted_at}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-black px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Mark Sold
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
