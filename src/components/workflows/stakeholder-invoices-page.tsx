"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Loader2, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

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
  description?: string;
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

const formatLabel = (value: string) => value.replaceAll("_", " ");

const getTenantName = (tenant?: Invoice["tenant"]) => {
  const name = [tenant?.profile?.first_name, tenant?.profile?.last_name].filter(Boolean).join(" ");
  return name || tenant?.email || "Tenant";
};

const INVOICE_TYPE_OPTIONS = [
  { id: "SERVICE_CHARGE", label: "Service Charge" },
  { id: "CAUTION_DEPOSIT", label: "Caution Deposit" },
  { id: "AGENCY_FEE", label: "Agency Fee" },
  { id: "LEGAL_FEE", label: "Legal Fee" },
];

export function StakeholderInvoicesPage({ role }: { role: "owner" | "agent" }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuingInvoice, setIssuingInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    target: "",
    type: "SERVICE_CHARGE",
    amount: "",
    due_date: "",
    description: "",
  });

  const fetchInvoices = async () => {
    try {
      const res = await api.get<Invoice[]>("/invoices/incoming");
      setInvoices(res || []);
    } catch (err) {
      console.error("Failed to load invoices", err);
      toast.error("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchInvoices();
    });
  }, []);

  const invoiceTargets = useMemo(() => {
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

  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");
  const openInvoices = invoices.filter((invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE");
  const totalPaid = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  const issueInvoice = async () => {
    const target = invoiceTargets.find((item) => item.key === invoiceForm.target);
    if (!target) {
      toast.error("Select a tenant/property first.");
      return;
    }

    const amount = Number(invoiceForm.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    setIssuingInvoice(true);
    try {
      const created = await api.post<Invoice>("/invoices", {
        tenant_id: target.tenant_id,
        property_id: target.property_id,
        lease_id: target.lease_id || undefined,
        type: invoiceForm.type,
        amount,
        due_date: invoiceForm.due_date ? new Date(invoiceForm.due_date).toISOString() : undefined,
        description: invoiceForm.description,
      });
      setInvoices((current) => [created, ...current]);
      setInvoiceForm({ target: invoiceForm.target, type: "SERVICE_CHARGE", amount: "", due_date: "", description: "" });
      toast.success("Invoice issued to tenant.");
    } catch (err) {
      console.error("Failed to issue invoice", err);
      toast.error("Failed to issue invoice.");
    } finally {
      setIssuingInvoice(false);
    }
  };

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
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Rent & Invoices</h1>
            <p className="text-gray-500 font-light mt-2">Issue extra tenant charges and monitor system-confirmed rent collection.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-full md:min-w-[480px]">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Paid</p>
            <p className="text-2xl font-bold text-white mt-1">{paidInvoices.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Open</p>
            <p className="text-2xl font-bold text-white mt-1">{openInvoices.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Collected</p>
            <p className="text-lg font-bold text-white mt-1">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Issue Tenant Invoice
            </h2>
            <p className="text-xs text-gray-500 mt-1">Rent invoices are generated by lease approval or renewal billing. Use this for agreed extra charges.</p>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{invoiceTargets.length} tenant records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <CustomSelect
            value={invoiceForm.target}
            onChange={(value) => setInvoiceForm((current) => ({ ...current, target: value }))}
            placeholder="Select tenant/property"
            options={invoiceTargets.map((target) => ({ id: target.key, label: target.label }))}
            icon={<FileText size={15} />}
            className="md:col-span-2"
            emptyLabel="No tenant records found."
          />
          <CustomSelect
            value={invoiceForm.type}
            onChange={(value) => setInvoiceForm((current) => ({ ...current, type: value }))}
            options={INVOICE_TYPE_OPTIONS}
            icon={<Wallet size={15} />}
          />
          <input
            value={invoiceForm.amount}
            onChange={(event) => setInvoiceForm((current) => ({ ...current, amount: event.target.value }))}
            placeholder="Amount"
            type="number"
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
          />
          <input
            value={invoiceForm.due_date}
            onChange={(event) => setInvoiceForm((current) => ({ ...current, due_date: event.target.value }))}
            type="date"
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            value={invoiceForm.description}
            onChange={(event) => setInvoiceForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Description"
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
          />
          <button
            onClick={issueInvoice}
            disabled={issuingInvoice || invoiceTargets.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-primary text-black px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-60"
          >
            {issuingInvoice ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Issue Invoice
          </button>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet size={18} className="text-green-500" />
            Invoice Ledger
          </h2>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{invoices.length} total</span>
        </div>

        <div className="divide-y divide-white/5">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-5 lg:items-center">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-bold text-white">{invoice.property?.title || "Property invoice"}</h3>
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                    invoice.status === "PAID" ? "bg-green-500/10 text-green-500" :
                    invoice.status === "OVERDUE" ? "bg-red-500/10 text-red-500" :
                    "bg-primary/10 text-primary"
                  )}>
                    {invoice.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{getTenantName(invoice.tenant)} • {formatLabel(invoice.type)}</p>
                {invoice.description && <p className="text-xs text-gray-600 max-w-2xl">{invoice.description}</p>}
              </div>

              <div className="lg:text-right">
                <p className="text-lg font-bold text-white">{formatCurrency(invoice.amount)}</p>
                {invoice.due_date && <p className="text-[10px] font-bold text-gray-500">Due {new Date(invoice.due_date).toLocaleDateString()}</p>}
              </div>

              <div className="lg:text-right min-w-[120px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {invoice.paid_at ? "Paid" : "Created"}
                </p>
                <p className="text-xs font-bold text-gray-400">
                  {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : "Awaiting payment"}
                </p>
              </div>
            </div>
          ))}

          {invoices.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm">No invoices have been issued yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
