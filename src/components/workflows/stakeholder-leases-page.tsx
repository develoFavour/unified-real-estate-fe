"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleDashed, FileText, Loader2, Upload, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { StakeholderLeaseDocumentsPanel } from "@/components/workflows/lease-documents-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  due_date?: string | null;
  paid_at?: string | null;
  description?: string;
  property?: {
    title?: string;
    location?: string;
  };
  tenant?: {
    email?: string;
    profile?: {
      first_name?: string;
      last_name?: string;
    };
  };
  lease?: {
    id: string;
    status: string;
    tenant_accepted?: boolean;
    start_date?: string;
    end_date?: string;
    documents?: {
      id: string;
      type: string;
      title: string;
      document_url: string;
    }[];
  } | null;
}

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

const REQUIRED_LEASE_DOCUMENTS = [
  { id: "LEASE_AGREEMENT", label: "Lease Agreement" },
  { id: "INSPECTION", label: "Inspection Report" },
  { id: "HANDOVER_NOTE", label: "Handover Note" },
  { id: "ID_VERIFICATION", label: "ID Verification" },
];

const getTenantName = (tenant?: LeaseRequest["tenant"] | Invoice["tenant"]) => {
  const name = [tenant?.profile?.first_name, tenant?.profile?.last_name].filter(Boolean).join(" ");
  return name || tenant?.email || "Tenant";
};

const getApprovedLeaseStage = (invoice: Invoice) => {
  if (invoice.lease?.status === "ACTIVE") return "ACTIVE";
  if (invoice.status === "PAID" && invoice.lease_id) {
    const uploadedTypes = new Set(invoice.lease?.documents?.map((document) => document.type) || []);
    const allDocsUploaded = REQUIRED_LEASE_DOCUMENTS.every((document) => uploadedTypes.has(document.id));
    return allDocsUploaded ? "AWAITING ACKNOWLEDGEMENT" : "AWAITING DOCUMENTS";
  }
  if (invoice.status === "PENDING" || invoice.status === "OVERDUE") return "AWAITING PAYMENT";
  return invoice.status;
};

const getDocumentProgress = (invoice: Invoice) => {
  const uploadedTypes = new Set(invoice.lease?.documents?.map((document) => document.type) || []);
  const missing = REQUIRED_LEASE_DOCUMENTS.filter((document) => !uploadedTypes.has(document.id));
  return {
    uploaded: REQUIRED_LEASE_DOCUMENTS.length - missing.length,
    total: REQUIRED_LEASE_DOCUMENTS.length,
    missing,
  };
};

const getStageHelperText = (stage: string) => {
  if (stage === "AWAITING PAYMENT") return "Tenant has been approved and rent invoice is waiting for payment.";
  if (stage === "AWAITING DOCUMENTS") return "Rent is paid. Upload the missing lease documents for tenant review.";
  if (stage === "AWAITING ACKNOWLEDGEMENT") return "All documents are uploaded. The tenant needs to review and acknowledge them.";
  if (stage === "ACTIVE") return "Lease is active and property is marked rented.";
  return "Lease record is being processed.";
};

export function StakeholderLeasesPage({ role }: { role: "owner" | "agent" }) {
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [requestRes, invoiceRes] = await Promise.allSettled([
        api.get<LeaseRequest[]>("/lease-requests/incoming"),
        api.get<Invoice[]>("/invoices/incoming"),
      ]);

      if (requestRes.status === "fulfilled") {
        setLeaseRequests(requestRes.value || []);
      }
      if (invoiceRes.status === "fulfilled") {
        setInvoices(invoiceRes.value || []);
      }
    } catch (err) {
      console.error("Failed to load lease management data", err);
      toast.error("Failed to load lease records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchData();
    });
  }, []);

  const reviewLeaseRequest = async (id: string, status: "APPROVED" | "REJECTED") => {
    setReviewingId(id);
    try {
      await api.patch(`/lease-requests/${id}/status`, { status });
      setLeaseRequests((current) => current.filter((request) => request.id !== id));
      toast.success(status === "APPROVED" ? "Lease request approved and invoice generated." : "Lease request rejected.");
      fetchData();
    } catch (err) {
      console.error("Failed to review lease request", err);
      toast.error("Failed to update lease request.");
    } finally {
      setReviewingId(null);
    }
  };

  const documentTargets = useMemo(() => {
    return invoices.reduce<{
      key: string;
      label: string;
      tenant_id: string;
      property_id: string;
      lease_id?: string | null;
    }[]>((targets, invoice) => {
      const key = invoice.lease_id || `${invoice.tenant_id}:${invoice.property_id}`;
      if (!invoice.tenant_id || !invoice.property_id || targets.some((target) => target.key === key)) {
        return targets;
      }
      targets.push({
        key,
        label: `${getTenantName(invoice.tenant)} - ${invoice.property?.title || "Property"}`,
        tenant_id: invoice.tenant_id,
        property_id: invoice.property_id,
        lease_id: invoice.lease_id,
      });
      return targets;
    }, []);
  }, [invoices]);
  const approvedLeaseInvoices = invoices.filter((invoice) => invoice.type === "RENT");

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <Link href={`/${role}`} className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Lease Management</h1>
            <p className="text-gray-500 font-light mt-2">Review tenant lease requests and manage handover documents.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 min-w-full md:min-w-[320px]">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pending Reviews</p>
            <p className="text-2xl font-bold text-white mt-1">{leaseRequests.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tenant Records</p>
            <p className="text-2xl font-bold text-white mt-1">{documentTargets.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 md:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Approved Leases</p>
            <p className="text-2xl font-bold text-white mt-1">{approvedLeaseInvoices.length}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid h-12 w-full max-w-xl grid-cols-3 gap-1 rounded-2xl border border-white/5 bg-white/[0.03] p-1">
          <TabsTrigger value="reviews" className="h-full rounded-xl border-0 px-4 py-0 text-xs font-bold after:hidden data-active:bg-primary data-active:text-black">
            Reviews ({leaseRequests.length})
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="h-full rounded-xl border-0 px-4 py-0 text-xs font-bold after:hidden data-active:bg-primary data-active:text-black">
            Pipeline ({approvedLeaseInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="h-full rounded-xl border-0 px-4 py-0 text-xs font-bold after:hidden data-active:bg-primary data-active:text-black">
            Documents ({documentTargets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Lease Reviews
          </h2>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{leaseRequests.length} pending</span>
        </div>

        <div className="divide-y divide-white/5">
          {leaseRequests.map((request) => (
            <div key={request.id} className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold text-white">{request.property?.title || "Rental Property"}</h3>
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                    request.status === "PENDING" ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-400"
                  )}>
                    {request.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{getTenantName(request.tenant)} requested lease terms.</p>
                {request.message && <p className="text-xs text-gray-500 max-w-3xl">{request.message}</p>}
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                  Requested {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => reviewLeaseRequest(request.id, "APPROVED")}
                  disabled={reviewingId === request.id}
                  className="inline-flex items-center gap-2 bg-primary text-black px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-60"
                >
                  {reviewingId === request.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => reviewLeaseRequest(request.id, "REJECTED")}
                  disabled={reviewingId === request.id}
                  className="inline-flex items-center gap-2 bg-white/5 text-gray-400 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all disabled:opacity-60"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            </div>
          ))}

          {leaseRequests.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm">No tenant lease requests are waiting on you.</p>
            </div>
          )}
        </div>
      </div>
        </TabsContent>

        <TabsContent value="pipeline">
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            Approved Lease Pipeline
          </h2>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{approvedLeaseInvoices.length} records</span>
        </div>

        <div className="divide-y divide-white/5">
          {approvedLeaseInvoices.map((invoice) => {
            const stage = getApprovedLeaseStage(invoice);
            const docProgress = getDocumentProgress(invoice);
            return (
              <div key={invoice.id} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-bold text-white">{invoice.property?.title || "Rental Property"}</h3>
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                      stage === "ACTIVE" ? "bg-green-500/10 text-green-500" :
                      stage === "AWAITING ACKNOWLEDGEMENT" ? "bg-blue-500/10 text-blue-400" :
                      stage === "AWAITING DOCUMENTS" ? "bg-orange-500/10 text-orange-400" :
                      "bg-primary/10 text-primary"
                    )}>
                      {stage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {getTenantName(invoice.tenant)} • {invoice.property?.location || "Location pending"}
                  </p>
                  <p className="text-xs text-gray-600">{getStageHelperText(stage)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Rent Invoice</p>
                    <p className="text-lg font-bold text-white mt-1">{formatCurrency(invoice.amount)}</p>
                    {invoice.due_date && stage === "AWAITING PAYMENT" && (
                      <p className="text-[10px] font-bold text-gray-500 mt-1">Due {new Date(invoice.due_date).toLocaleDateString()}</p>
                    )}
                    {invoice.paid_at && stage !== "AWAITING PAYMENT" && (
                      <p className="text-[10px] font-bold text-gray-500 mt-1">Paid {new Date(invoice.paid_at).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Documents</p>
                    <p className="text-lg font-bold text-white mt-1">{docProgress.uploaded}/{docProgress.total}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">
                      {invoice.lease_id ? docProgress.missing.length === 0 ? "Complete" : "Missing documents" : "Available after payment"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tenant Review</p>
                    <p className={cn(
                      "text-sm font-bold mt-2",
                      invoice.lease?.tenant_accepted ? "text-green-500" : "text-primary"
                    )}>
                      {invoice.lease?.tenant_accepted ? "Acknowledged" : invoice.lease_id ? "Pending" : "Not started"}
                    </p>
                  </div>
                </div>

                {invoice.lease_id && stage !== "ACTIVE" && (
                  <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                    {docProgress.missing.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Upload size={14} /> Next action: upload missing documents
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {docProgress.missing.map((document) => (
                            <span key={document.id} className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-[10px] font-bold text-gray-400">
                              <CircleDashed size={12} /> {document.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Documents are complete. The tenant has been notified and should acknowledge the lease from their leases page.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {approvedLeaseInvoices.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm">Approved lease records will appear here after requests are approved.</p>
            </div>
          )}
        </div>
      </div>
        </TabsContent>

        <TabsContent value="documents">
          <StakeholderLeaseDocumentsPanel targets={documentTargets} />
          {documentTargets.length === 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-12 text-center">
              <p className="text-gray-500 text-sm">Document upload becomes available after a tenant pays rent and a lease record is created.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
