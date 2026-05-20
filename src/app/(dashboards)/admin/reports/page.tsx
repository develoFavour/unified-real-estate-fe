"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Loader2,
  ReceiptText,
  Search,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
  description: string;
  meta_data?: string;
  created_at: string;
  wallet?: {
    user?: {
      email: string;
      role: string;
      profile?: {
        full_name?: string;
      };
    };
  };
}

interface PaymentLedgerResponse {
  transactions: WalletTransaction[];
  total_volume: number;
}

const types = ["ALL", "DEPOSIT", "WITHDRAWAL", "PAYMENT", "REFUND"];
const statuses = ["ALL", "SUCCESS", "PENDING", "FAILED", "CANCELLED"];

const formatCurrency = (amount: number) => `NGN ${Number(amount || 0).toLocaleString()}`;
const formatLabel = (value: string) => value.replaceAll("_", " ");

const parseMeta = (meta?: string) => {
  if (!meta) return {};
  try {
    return JSON.parse(meta) as Record<string, string>;
  } catch {
    return {};
  }
};

export default function AdminReportsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PaymentLedgerResponse>(ENDPOINTS.ADMIN.PAYMENTS, {
        search,
        type,
        status,
      });
      setTransactions(data.transactions || []);
      setTotalVolume(data.total_volume || 0);
    } catch (err) {
      console.error("Failed to load payment ledger", err);
      toast.error("Failed to load payment ledger.");
    } finally {
      setLoading(false);
    }
  }, [search, type, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      queueMicrotask(() => {
        fetchLedger();
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchLedger]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.status === "SUCCESS") {
          if (tx.type === "DEPOSIT" || tx.type === "REFUND") acc.inflow += tx.amount;
          if (tx.type === "PAYMENT" || tx.type === "WITHDRAWAL") acc.outflow += tx.amount;
        }
        if (tx.status === "PENDING") acc.pending += 1;
        if (tx.status === "FAILED" || tx.status === "CANCELLED") acc.flagged += 1;
        return acc;
      },
      { inflow: 0, outflow: 0, pending: 0, flagged: 0 }
    );
  }, [transactions]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Payment Oversight</h1>
          <p className="text-gray-500 font-light">Audit wallet deposits, withdrawals, invoice payments, refunds, and Paystack references.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Search reference, user..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <select value={type} onChange={(event) => setType(event.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {types.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {statuses.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Volume", value: formatCurrency(totalVolume), icon: Wallet, color: "text-primary" },
          { label: "Loaded Inflow", value: formatCurrency(summary.inflow), icon: ArrowDownLeft, color: "text-green-500" },
          { label: "Loaded Outflow", value: formatCurrency(summary.outflow), icon: ArrowUpRight, color: "text-orange-500" },
          { label: "Pending / Flagged", value: `${summary.pending} / ${summary.flagged}`, icon: CreditCard, color: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] space-y-5">
            <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center", stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold font-heading mt-2">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold font-heading">Transaction Ledger</h3>
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{transactions.length} loaded</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : transactions.map((tx) => {
                const meta = parseMeta(tx.meta_data);
                const user = tx.wallet?.user;
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <p className="font-mono text-xs text-gray-300">{tx.reference || tx.id}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{tx.type}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-white">{user?.profile?.full_name || user?.email || "Unknown user"}</p>
                      <p className="text-[10px] text-gray-500">{user?.role || "N/A"}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-start gap-2 max-w-sm">
                        <ReceiptText size={14} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">{tx.description || "Wallet transaction"}</p>
                          {meta.payment_type && <p className="text-[10px] text-gray-600 mt-1">{formatLabel(meta.payment_type)}</p>}
                        </div>
                      </div>
                    </td>
                    <td className={cn(
                      "px-6 py-6 text-sm font-bold",
                      tx.type === "DEPOSIT" || tx.type === "REFUND" ? "text-green-500" : "text-primary"
                    )}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter",
                        tx.status === "SUCCESS" ? "bg-green-500/10 text-green-500" :
                          tx.status === "PENDING" ? "bg-orange-500/10 text-orange-500" :
                            "bg-red-500/10 text-red-500"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">No transactions match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
