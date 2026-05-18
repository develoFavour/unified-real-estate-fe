"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Loader2,
  ReceiptText,
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { cn } from "@/lib/utils";
import { SaleReservationsPanel } from "@/components/workflows/sale-reservations-panel";
import { toast } from "sonner";

interface WalletTransaction {
  id: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "PAYMENT" | "REFUND" | string;
  status: string;
  reference: string;
  description: string;
  meta_data?: string;
  created_at: string;
}

interface Invoice {
  id: string;
  amount: number;
  type: string;
  status: string;
  due_date?: string | null;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  paid_at?: string | null;
  payment_reference: string;
  description: string;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
  };
}

interface WalletData {
  pin_set_at?: string | null;
}

interface TransactionMeta {
  invoice_id?: string;
  invoice_type?: string;
  property_id?: string;
  payment_type?: string;
}

const PAGE_SIZE = 8;

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

const getTransactionIcon = (type: string) => {
  if (type === "DEPOSIT" || type === "REFUND") {
    return ArrowDownLeft;
  }
  return ArrowUpRight;
};

const getSignedAmount = (tx: WalletTransaction) => {
  return tx.type === "DEPOSIT" || tx.type === "REFUND"
    ? `+${formatCurrency(tx.amount)}`
    : `-${formatCurrency(tx.amount)}`;
};

const receiptAvailable = (tx: WalletTransaction) => {
  return tx.status === "SUCCESS" && Boolean(tx.reference);
};

const parseTransactionMeta = (tx: WalletTransaction): TransactionMeta => {
  if (!tx.meta_data) return {};
  try {
    return JSON.parse(tx.meta_data) as TransactionMeta;
  } catch {
    return {};
  }
};

const formatLabel = (value?: string) => {
  return value ? value.replaceAll("_", " ") : "";
};

const getPaymentContext = (tx: WalletTransaction, invoice?: Invoice) => {
  const meta = parseTransactionMeta(tx);
  if (invoice) {
    return {
      label: formatLabel(invoice.type),
      detail: invoice.property?.title || invoice.description || "Invoice payment",
      propertyID: invoice.property?.id || meta.property_id,
      invoiceStatus: invoice.status,
      meta,
    };
  }

  if (meta.payment_type === "RESERVATION_DEPOSIT") {
    return {
      label: "RESERVATION DEPOSIT",
      detail: tx.description || "Sale reservation deposit",
      propertyID: meta.property_id,
      meta,
    };
  }

  return {
    label: formatLabel(meta.payment_type) || tx.type,
    detail: tx.description || "Wallet transaction",
    propertyID: meta.property_id,
    meta,
  };
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default function TenantPaymentsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingInvoiceID, setPayingInvoiceID] = useState<string | null>(null);
  const [pinPromptInvoiceID, setPinPromptInvoiceID] = useState<string | null>(null);
  const [paymentPin, setPaymentPin] = useState("");
  const [page, setPage] = useState(1);

  const refreshPaymentsData = async () => {
    const [txRes, invoiceRes, walletRes] = await Promise.all([
      api.get<WalletTransaction[]>("/wallet/transactions"),
      api.get<Invoice[]>("/tenant/invoices"),
      api.get<WalletData>("/wallet"),
    ]);
    setTransactions(txRes || []);
    setInvoices(invoiceRes || []);
    setWallet(walletRes);
  };

  useEffect(() => {
    queueMicrotask(() => {
      refreshPaymentsData()
        .catch((err) => console.error("Failed to fetch wallet transactions", err))
        .finally(() => setLoading(false));
    });
  }, []);

  const pendingInvoices = useMemo(() => {
    return invoices.filter((invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE");
  }, [invoices]);

  const invoiceByPaymentReference = useMemo(() => {
    return invoices.reduce<Record<string, Invoice>>((acc, invoice) => {
      if (invoice.payment_reference) {
        acc[invoice.payment_reference] = invoice;
      }
      return acc;
    }, {});
  }, [invoices]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return transactions.slice(start, start + PAGE_SIZE);
  }, [page, transactions]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.status !== "SUCCESS") return acc;
        if (tx.type === "DEPOSIT" || tx.type === "REFUND") {
          acc.inflow += tx.amount;
        } else {
          acc.outflow += tx.amount;
        }
        return acc;
      },
      { inflow: 0, outflow: 0 }
    );
  }, [transactions]);

  const payInvoice = async (invoiceID: string, pin: string) => {
    setPayingInvoiceID(invoiceID);
    try {
      await api.post(`/wallet/invoices/${invoiceID}/pay`, { pin });
      await refreshPaymentsData();
      toast.success("Invoice paid successfully");
      setPinPromptInvoiceID(null);
      setPaymentPin("");
    } catch (err) {
      console.error("Failed to pay invoice", err);
      toast.error("Failed to pay invoice. Check your wallet PIN and balance.");
    } finally {
      setPayingInvoiceID(null);
    }
  };

  const openReceipt = (tx: WalletTransaction, invoice?: Invoice) => {
    if (!receiptAvailable(tx)) return;
    const context = getPaymentContext(tx, invoice);

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt ${tx.reference}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
            .receipt { max-width: 640px; margin: 0 auto; border: 1px solid #ddd; padding: 32px; border-radius: 16px; }
            h1 { margin: 0 0 8px; }
            .muted { color: #666; font-size: 13px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 14px 0; gap: 24px; }
            .label { color: #666; }
            .value { font-weight: 700; text-align: right; }
            .amount { font-size: 28px; margin: 24px 0; }
            button { margin-top: 24px; padding: 12px 18px; border: 0; border-radius: 8px; background: #111; color: white; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h1>Payment Receipt</h1>
            <p class="muted">${invoice ? "Real Estate Platform invoice payment" : context.label === "RESERVATION DEPOSIT" ? "Real Estate Platform sale reservation payment" : "Real Estate Platform tenant wallet transaction"}</p>
            <div class="amount">${getSignedAmount(tx)}</div>
            ${invoice?.property ? `<div class="row"><span class="label">Property</span><span class="value">${escapeHtml(invoice.property.title)}</span></div>` : ""}
            ${invoice ? `<div class="row"><span class="label">Invoice Type</span><span class="value">${escapeHtml(invoice.type)}</span></div>` : ""}
            ${invoice ? `<div class="row"><span class="label">Invoice Status</span><span class="value">${escapeHtml(invoice.status)}</span></div>` : ""}
            ${invoice?.due_date ? `<div class="row"><span class="label">Invoice Due Date</span><span class="value">${new Date(invoice.due_date).toLocaleDateString()}</span></div>` : ""}
            ${invoice?.billing_period_start ? `<div class="row"><span class="label">Billing Period Starts</span><span class="value">${new Date(invoice.billing_period_start).toLocaleDateString()}</span></div>` : ""}
            ${invoice?.billing_period_end ? `<div class="row"><span class="label">Billing Period Ends</span><span class="value">${new Date(invoice.billing_period_end).toLocaleDateString()}</span></div>` : ""}
            ${!invoice && context.label ? `<div class="row"><span class="label">Payment Purpose</span><span class="value">${escapeHtml(context.label)}</span></div>` : ""}
            ${context.propertyID ? `<div class="row"><span class="label">Property ID</span><span class="value">${escapeHtml(context.propertyID)}</span></div>` : ""}
            <div class="row"><span class="label">Description</span><span class="value">${escapeHtml(tx.description || "Wallet Transaction")}</span></div>
            <div class="row"><span class="label">Reference</span><span class="value">${escapeHtml(tx.reference)}</span></div>
            <div class="row"><span class="label">Type</span><span class="value">${escapeHtml(tx.type)}</span></div>
            <div class="row"><span class="label">Status</span><span class="value">${escapeHtml(tx.status)}</span></div>
            <div class="row"><span class="label">Date</span><span class="value">${new Date(tx.created_at).toLocaleString()}</span></div>
            <button onclick="window.print()">Print / Save PDF</button>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: "text/html" });
    const receiptUrl = URL.createObjectURL(blob);
    const receiptWindow = window.open(receiptUrl, "_blank", "noopener,noreferrer");
    if (!receiptWindow) {
      URL.revokeObjectURL(receiptUrl);
      return;
    }

    window.setTimeout(() => URL.revokeObjectURL(receiptUrl), 60_000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {pinPromptInvoiceID && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPinPromptInvoiceID(null)} />
          <div className="relative bg-black border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold font-heading mb-3">Confirm Payment</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">Enter your wallet PIN to authorize this invoice payment.</p>
            {!wallet?.pin_set_at ? (
              <div className="space-y-4">
                <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl">
                  <p className="text-sm font-bold text-primary mb-2">Wallet PIN required</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Create your 4-digit wallet PIN before paying invoices.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPinPromptInvoiceID(null)}
                    className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <Link
                    href="/tenant/settings#wallet-pin"
                    className="flex-1 bg-primary text-black font-black py-4 rounded-2xl hover:bg-primary-hover transition-all text-center"
                  >
                    Set PIN
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={paymentPin}
                onChange={(event) => setPaymentPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4-digit PIN"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-primary/50 transition-all outline-none text-lg font-bold"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPinPromptInvoiceID(null);
                    setPaymentPin("");
                  }}
                  className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={paymentPin.length !== 4 || payingInvoiceID === pinPromptInvoiceID}
                  onClick={() => payInvoice(pinPromptInvoiceID, paymentPin)}
                  className="flex-1 bg-primary text-black font-black py-4 rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {payingInvoiceID === pinPromptInvoiceID ? <Loader2 className="animate-spin" size={18} /> : "Pay"}
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Payments & Receipts</h1>
          <p className="text-gray-500 font-light text-lg">Review all wallet deposits, property payments, withdrawals, and receipts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] space-y-4">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Successful Inflow</p>
          <h3 className="text-4xl font-bold font-heading text-white">{formatCurrency(summary.inflow)}</h3>
        </div>
        <div className="bg-primary/10 border border-primary/20 p-8 rounded-[2.5rem] space-y-4">
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Successful Outflow</p>
          <h3 className="text-4xl font-bold font-heading text-primary">{formatCurrency(summary.outflow)}</h3>
        </div>
        <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] space-y-4">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Pending Invoices</p>
          <h3 className="text-4xl font-bold font-heading text-white">{pendingInvoices.length}</h3>
        </div>
      </div>

      {pendingInvoices.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold font-heading text-white px-4">Pending Invoices</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{formatLabel(invoice.type)}</p>
                      <span className={cn(
                        "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                        invoice.status === "OVERDUE" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                      )}>
                        {invoice.status}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-white">{invoice.property?.title || "Property Invoice"}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {invoice.description || "Invoice generated from an approved lease request."}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CreditCard size={20} />
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Amount Due</p>
                    <p className="text-2xl font-bold font-heading text-primary">{formatCurrency(invoice.amount)}</p>
                    {invoice.due_date && (
                      <p className="text-[10px] text-gray-500 mt-1">Due {new Date(invoice.due_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setPinPromptInvoiceID(invoice.id)}
                    disabled={payingInvoiceID === invoice.id}
                    className="bg-white text-black font-black px-5 py-3 rounded-2xl hover:bg-primary transition-all uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-60"
                  >
                    {payingInvoiceID === invoice.id ? <Loader2 className="animate-spin" size={16} /> : "Pay Invoice"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SaleReservationsPanel mode="buyer" />

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 px-4">
          <h3 className="text-2xl font-bold font-heading text-white">Transaction Ledger</h3>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Page {page} of {totalPages}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                  <th className="px-8 py-6">Reference & Description</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedTransactions.map((tx) => {
                  const Icon = getTransactionIcon(tx.type);
                  const invoice = invoiceByPaymentReference[tx.reference];
                  const context = getPaymentContext(tx, invoice);
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            tx.type === "DEPOSIT" || tx.type === "REFUND"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-primary/10 text-primary"
                          )}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase tracking-tight">{tx.description || "Wallet Transaction"}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                              {tx.reference || tx.id.substring(0, 8)} • {context.label}
                            </p>
                            {context.propertyID && (
                              <p className="text-[10px] text-gray-600 font-bold mt-1">Property Ref: {context.propertyID.substring(0, 8)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-sm text-gray-400 font-medium">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td className={cn(
                        "px-8 py-8 text-lg font-bold",
                        tx.type === "DEPOSIT" || tx.type === "REFUND" ? "text-green-500" : "text-white"
                      )}>
                        {getSignedAmount(tx)}
                      </td>
                      <td className="px-8 py-8">
                        {tx.status === "SUCCESS" ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-lg uppercase tracking-widest border border-green-500/10">
                            <CheckCircle2 size={12} /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg uppercase tracking-widest border border-primary/10">
                            <Clock size={12} /> {tx.status}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-8 text-right">
                        {receiptAvailable(tx) ? (
                          <button
                            onClick={() => openReceipt(tx, invoice)}
                            className="p-3 hover:bg-primary hover:text-black rounded-2xl transition-all text-primary bg-primary/5 border border-primary/10"
                            title="Open receipt"
                          >
                            <Download size={20} />
                          </button>
                        ) : (
                          <span className="inline-flex items-center justify-end gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                            <ReceiptText size={14} /> Unavailable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="py-20 text-center text-gray-600 italic">
                No transactions recorded yet.
              </div>
            )}
          </div>

          {transactions.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-8 py-6 border-t border-white/5">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


