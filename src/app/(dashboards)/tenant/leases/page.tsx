"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, FileText, Home, Loader2, ReceiptText } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import { TenantLeaseDocumentsPanel } from "@/components/workflows/lease-documents-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardData {
  lease?: {
    id: string;
    start_date: string;
    end_date: string;
    rent_amount: number;
    status: string;
    tenant_accepted?: boolean;
  };
  property?: {
    id: string;
    title: string;
    location: string;
  };
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
}

interface Invoice {
  id: string;
  property_id: string;
  lease_request_id?: string | null;
  type: string;
  status: string;
}

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

export default function TenantLeasesPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashboardRes, requestRes, invoiceRes] = await Promise.allSettled([
        api.get<DashboardData>(ENDPOINTS.TENANT.DASHBOARD),
        api.get<LeaseRequest[]>("/tenant/lease-requests"),
        api.get<Invoice[]>("/tenant/invoices"),
      ]);

      if (dashboardRes.status === "fulfilled") {
        setDashboard(dashboardRes.value);
      }
      if (requestRes.status === "fulfilled") {
        setLeaseRequests(requestRes.value || []);
      }
      if (invoiceRes.status === "fulfilled") {
        setInvoices(invoiceRes.value || []);
      }
    } catch (err) {
      console.error("Failed to load tenant leases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchData();
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const activeLease = dashboard?.lease;
  const getRequestPaymentState = (request: LeaseRequest) => {
    const relatedInvoices = invoices.filter((invoice) => (
      invoice.type === "RENT" &&
      (invoice.lease_request_id === request.id || invoice.property_id === request.property?.id)
    ));
    const payableInvoice = relatedInvoices.find((invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE");
    const paidInvoice = relatedInvoices.find((invoice) => invoice.status === "PAID");

    if (payableInvoice) return "PAYABLE";
    if (paidInvoice) return "PAID";
    return "NONE";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <Link href="/tenant" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">My Leases</h1>
            <p className="text-gray-500 font-light mt-2">Track lease requests, active lease terms, and required acknowledgements.</p>
          </div>
        </div>
        <Link href="/properties" className="inline-flex items-center gap-2 bg-primary text-black px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all">
          Find a Home
        </Link>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid h-12 w-full max-w-md grid-cols-2 gap-1 rounded-2xl border border-white/5 bg-white/[0.03] p-1">
          <TabsTrigger value="current" className="h-full rounded-xl border-0 px-4 py-0 text-xs font-bold after:hidden data-active:bg-primary data-active:text-black">
            Current Lease ({activeLease ? 1 : 0})
          </TabsTrigger>
          <TabsTrigger value="requests" className="h-full rounded-xl border-0 px-4 py-0 text-xs font-bold after:hidden data-active:bg-primary data-active:text-black">
            Requests ({leaseRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-8">
          {activeLease ? (
            <>
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Home size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {activeLease.status === "ACTIVE" ? "Official Active Lease" : "Lease Pending Acknowledgement"}
                      </p>
                      <h2 className="text-xl font-bold text-white mt-1">{dashboard?.property?.title || "Rental Property"}</h2>
                      <p className="text-sm text-gray-500 mt-1">{dashboard?.property?.location || "Location pending"}</p>
                    </div>
                  </div>

                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                    activeLease.status === "ACTIVE"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-primary/10 text-primary border-primary/20"
                  )}>
                    <CheckCircle2 size={14} />
                    {activeLease.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { icon: ReceiptText, label: "Annual Rent", value: formatCurrency(activeLease.rent_amount) },
                    { icon: CalendarDays, label: "Lease Starts", value: new Date(activeLease.start_date).toLocaleDateString() },
                    { icon: CalendarDays, label: "Lease Ends", value: new Date(activeLease.end_date).toLocaleDateString() },
                    { icon: FileText, label: "Documents", value: activeLease.tenant_accepted ? "Acknowledged" : "Awaiting acknowledgement" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <div className="flex items-center gap-2 text-primary mb-3">
                        <item.icon size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</p>
                      </div>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {activeLease.status === "ACTIVE"
                      ? "This lease is active. Keep the uploaded documents as your platform record for tenancy, handover, and future maintenance or renewal discussions."
                      : "Review the uploaded documents below. Once you acknowledge them, the lease becomes active and the property is marked rented."}
                  </p>
                </div>
              </div>

              <TenantLeaseDocumentsPanel leaseId={activeLease.id} accepted={activeLease.tenant_accepted} onAccepted={fetchData} />
            </>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-12 text-center">
              <p className="text-gray-500 text-sm">No active lease yet. Approved and paid leases will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Lease Requests
              </h2>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{leaseRequests.length} total</span>
            </div>

            <div className="divide-y divide-white/5">
              {leaseRequests.map((request) => (
                <div key={request.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div>
                    <h3 className="text-sm font-bold text-white">{request.property?.title || "Rental Property"}</h3>
                    <p className="text-xs text-gray-500 mt-1">{request.property?.location || "Location pending"}</p>
                    {request.message && <p className="text-xs text-gray-600 mt-2 max-w-2xl">{request.message}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {request.status === "APPROVED" && getRequestPaymentState(request) === "PAYABLE" && (
                      <Link
                        href="/tenant/payments"
                        className="inline-flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all"
                      >
                        <CreditCard size={13} />
                        Pay Rent Invoice
                      </Link>
                    )}
                    {request.status === "APPROVED" && getRequestPaymentState(request) === "PAID" && (
                      <span className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={13} />
                        Payment Complete
                      </span>
                    )}
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      request.status === "APPROVED" ? "bg-green-500/10 text-green-500" :
                      request.status === "REJECTED" ? "bg-red-500/10 text-red-500" :
                      "bg-primary/10 text-primary"
                    )}>
                      {request.status}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {leaseRequests.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-sm">You have not requested any leases yet.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
