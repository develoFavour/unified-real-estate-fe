"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Clock,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Building2,
  CreditCard,
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WalletData {
  balance: number;
  virtual_account_no: string;
  bank_name: string;
  account_name: string;
  pin_set_at?: string | null;
  pin_locked_until?: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
}

interface PaymentInitialization {
  authorization_url: string;
  access_code: string;
  reference: string;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof err.response === "object" &&
    err.response !== null &&
    "data" in err.response &&
    typeof err.response.data === "object" &&
    err.response.data !== null &&
    "message" in err.response.data &&
    typeof err.response.data.message === "string"
  ) {
    return err.response.data.message;
  }

  return err instanceof Error ? err.message : fallback;
};

export default function TenantWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [showWithdrawPinModal, setShowWithdrawPinModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showTopUpPinModal, setShowTopUpPinModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpPin, setTopUpPin] = useState("");
  const [processingTopUp, setProcessingTopUp] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const confirmedReference = useRef<string | null>(null);
  const recentTransactions = transactions.slice(0, 4);

  const refreshWalletData = async () => {
    const [walletRes, txRes] = await Promise.all([
      api.get<WalletData>("/wallet"),
      api.get<Transaction[]>("/wallet/transactions"),
    ]);
    setWallet(walletRes);
    setTransactions(txRes || []);
  };

  useEffect(() => {
    queueMicrotask(() => {
      refreshWalletData()
        .catch(() => toast.error("Failed to load wallet information"))
        .finally(() => setLoading(false));
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference || confirmedReference.current === reference) {
      return;
    }

    queueMicrotask(() => {
      confirmedReference.current = reference;
      setConfirmingPayment(true);
      toast.info("Confirming your Paystack payment...");

      api.post<WalletData>("/wallet/confirm", { reference })
        .then(async (walletRes) => {
          setWallet(walletRes);
          const txRes = await api.get<Transaction[]>("/wallet/transactions");
          setTransactions(txRes || []);
          toast.success("Wallet balance updated");
          window.history.replaceState(null, "", window.location.pathname);
        })
        .catch((err: unknown) => {
          toast.error(getErrorMessage(err, "Unable to confirm payment"));
        })
        .finally(() => setConfirmingPayment(false));
    });
  }, []);

  const handleWithdrawRequest = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!wallet?.pin_set_at) {
      toast.error("Set your wallet PIN before withdrawing");
      return;
    }

    setShowWithdrawPinModal(true);
  };

  const confirmWithdraw = async () => {
    setWithdrawing(true);
    try {
      await api.post("/wallet/withdraw", { amount: parseFloat(withdrawAmount), pin: withdrawPin });
      toast.success("Withdrawal initiated successfully!");
      setWithdrawAmount("");
      setWithdrawPin("");
      setShowWithdrawPinModal(false);
      await refreshWalletData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Withdrawal failed"));
    } finally {
      setWithdrawing(false);
    }
  };

  const handleTopUpAmountRequest = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!wallet?.pin_set_at) {
      toast.error("Set your wallet PIN before making deposits");
      return;
    }

    setShowTopUpModal(false);
    setShowTopUpPinModal(true);
  };

  const confirmTopUp = async () => {
    setProcessingTopUp(true);
    try {
      const callbackUrl = `${window.location.origin}/tenant/wallet`;
      const amount = parseFloat(topUpAmount);
      const payment = await api.post<PaymentInitialization>("/wallet/initialize", {
        amount,
        callback_url: callbackUrl,
        pin: topUpPin,
      });
      if (!payment.authorization_url) {
        throw new Error("Paystack did not return a checkout link");
      }

      const checkoutWindow = window.open(payment.authorization_url, "_blank", "noopener,noreferrer");
      if (!checkoutWindow) {
        window.location.href = payment.authorization_url;
        return;
      }

      toast.success("Paystack Checkout opened in a new tab");
      setShowTopUpPinModal(false);
      setTopUpAmount("");
      setTopUpPin("");
      setProcessingTopUp(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Unable to start payment"));
      setProcessingTopUp(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">My Wallet</h1>
          <p className="text-gray-500 font-light italic">
            {confirmingPayment ? "Confirming your latest payment..." : "Your gateway to property ownership."}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="bg-primary/10 border border-primary/20 text-primary px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-primary/20 transition-all"
          >
            <Plus size={18} /> Top Up
          </button>
        </div>
      </div>

      {showTopUpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowTopUpModal(false);
              setTopUpPin("");
            }}
          />
          <div className="relative bg-black border border-white/10 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold font-heading mb-3">Top Up Wallet</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Pay securely with card, bank transfer, USSD, or any method available on Paystack Checkout.
            </p>
            {!wallet?.pin_set_at ? (
              <div className="space-y-6">
                <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl">
                  <p className="text-sm font-bold text-primary mb-2">Wallet PIN required</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Create your 4-digit wallet PIN in settings before making deposits or payments.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowTopUpModal(false)}
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
              <form onSubmit={handleTopUpAmountRequest} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-4">Amount (NGN)</label>
                  <input
                    autoFocus
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500000)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-primary/50 transition-all outline-none text-lg font-bold"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTopUpModal(false);
                      setTopUpPin("");
                    }}
                    className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!topUpAmount || processingTopUp}
                    className="flex-1 bg-primary text-black font-black py-4 rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showTopUpPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowTopUpPinModal(false);
              setTopUpPin("");
            }}
          />
          <div className="relative bg-black border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold font-heading mb-3">Authorize Deposit</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Enter your 4-digit wallet PIN to deposit NGN {Number(topUpAmount || 0).toLocaleString()}.
            </p>
            <div className="space-y-4">
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={topUpPin}
                onChange={(event) => setTopUpPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4-digit PIN"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-primary/50 transition-all outline-none text-lg font-bold"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTopUpPinModal(false);
                    setShowTopUpModal(true);
                    setTopUpPin("");
                  }}
                  className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={topUpPin.length !== 4 || processingTopUp}
                  onClick={confirmTopUp}
                  className="flex-1 bg-primary text-black font-black py-4 rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {processingTopUp ? <Loader2 className="animate-spin" size={18} /> : "Proceed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWithdrawPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowWithdrawPinModal(false);
              setWithdrawPin("");
            }}
          />
          <div className="relative bg-black border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold font-heading mb-3">Confirm Withdrawal</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Enter your 4-digit wallet PIN to withdraw NGN {Number(withdrawAmount || 0).toLocaleString()}.
            </p>
            <div className="space-y-4">
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={withdrawPin}
                onChange={(event) => setWithdrawPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4-digit PIN"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-primary/50 transition-all outline-none text-lg font-bold"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawPinModal(false);
                    setWithdrawPin("");
                  }}
                  className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={withdrawPin.length !== 4 || withdrawing}
                  onClick={confirmWithdraw}
                  className="flex-1 bg-primary text-black font-black py-4 rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {withdrawing ? <Loader2 className="animate-spin" size={18} /> : "Withdraw"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-black to-black border border-white/10 rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-12 shadow-2xl">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>

            <div className="relative z-10 space-y-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
                <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                  <Wallet className="text-primary" size={28} />
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Currency</p>
                  <p className="font-bold text-white">NGN - Nigerian Naira</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Total Balance</p>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tighter break-words">
                  NGN {wallet?.balance.toLocaleString() || "0.00"}
                </h2>
              </div>

              <div className="pt-8 lg:pt-10 border-t border-white/5 flex flex-col sm:flex-row gap-6 lg:gap-12">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Savings Goal Progress</p>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-green-500" size={16} />
                    <span className="font-bold">12.5% achieved</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Deposit Status</p>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary" size={16} />
                    <span className="font-bold">Checkout Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-bold font-heading">Recent Transactions</h3>
              {transactions.length > 4 && (
                <Link href="/tenant/payments" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors">
                  View All
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                <div key={tx.id} className="bg-white/[0.02] border border-white/5 p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 group hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                      tx.type === "DEPOSIT"
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                      {tx.type === "DEPOSIT" ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold group-hover:text-primary transition-colors break-words">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock size={12} />
                        <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className={cn(
                      "text-lg font-bold font-heading",
                      tx.type === "DEPOSIT" ? "text-green-500" : "text-white"
                    )}>
                      {tx.type === "DEPOSIT" ? "+" : "-"}NGN {tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-40">{tx.status}</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem]">
                  <p className="text-gray-500 italic">No transactions yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] space-y-8">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6">Deposit Method</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-8">
                Use Paystack Checkout to fund your wallet with card, transfer, USSD, or bank app options.
              </p>

              <div className="space-y-4">
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Paystack Checkout</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2">
                      Checkout opens in a new tab and returns here after payment confirmation.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTopUpModal(true)}
                    className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary-hover transition-all text-xs"
                  >
                    Deposit Funds
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Withdraw Funds</h4>
              <form onSubmit={handleWithdrawRequest} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-4">Amount (NGN)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary/50 transition-all outline-none text-sm font-bold"
                  />
                </div>
                {!wallet?.pin_set_at && (
                  <Link
                    href="/tenant/settings#wallet-pin"
                    className="block rounded-2xl border border-primary/20 bg-primary/10 p-4 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                  >
                    Set your 4-digit wallet PIN in settings before withdrawing.
                  </Link>
                )}
                <button
                  type="submit"
                  disabled={withdrawing || !withdrawAmount || !wallet?.pin_set_at}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-primary transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  {withdrawing ? <Loader2 className="animate-spin" size={16} /> : <><ArrowUpRight size={16} /> Withdraw to Bank</>}
                </button>
                <p className="text-[10px] text-gray-600 text-center italic">Funds will be sent to your linked payout method.</p>
              </form>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Why fund your wallet?</h4>
              <div className="space-y-4">
                {[
                  { icon: Building2, title: "Property Reservation", desc: "Pay reservation deposits for sale properties pending review." },
                  { icon: CreditCard, title: "Automated Saving", desc: "Build your downpayment profile for house purchase." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">{item.title}</p>
                      <p className="text-[10px] text-gray-500 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
