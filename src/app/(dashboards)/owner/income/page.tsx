"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Download,
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Wallet
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  payment_reference: string;
  payment_date: string;
  status: string;
}

interface IncomeReport {
  history: Payment[];
  monthly_stats: { month: string; total: number }[];
  total_revenue: number;
}

export default function RentalIncomePage() {
  const [report, setReport] = useState<IncomeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.get<IncomeReport>(ENDPOINTS.INCOME.OWNER);
        setReport(data);
      } catch (err) {
        console.error("Failed to fetch income report", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 w-1/3 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-[2rem]" />)}
        </div>
        <div className="h-96 w-full bg-white/5 rounded-[3rem]" />
      </div>
    );
  }

  const maxIncome = Math.max(...(report?.monthly_stats.map(s => s.total) || [1]));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Rental Income</h1>
          <p className="text-gray-500 font-light">Monitor your property revenue and financial performance.</p>
        </div>
        <button className="bg-primary text-black px-8 py-4 rounded-2xl font-bold shadow-[0_10px_30px_rgba(193,155,118,0.2)] hover:bg-primary-hover transition-all flex items-center gap-2 group">
          <Download size={20} className="group-hover:-translate-y-1 transition-transform" /> 
          Export Report
        </button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary border border-primary/20 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(193,155,118,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <Wallet size={120} className="text-black" />
          </div>
          <p className="text-black/60 text-[10px] font-black uppercase tracking-widest mb-2">Total Portfolio Revenue</p>
          <h2 className="text-4xl font-bold text-black mb-6">₦{(report?.total_revenue || 0).toLocaleString()}</h2>
          <div className="flex items-center gap-2 text-black/80 text-xs font-bold bg-black/5 w-fit px-3 py-1.5 rounded-xl">
            <TrendingUp size={14} /> +12.5% from last month
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Monthly Average</p>
            <h3 className="text-2xl font-bold text-white">₦{((report?.total_revenue || 0) / (report?.monthly_stats.length || 1)).toLocaleString()}</h3>
          </div>
          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="text-xs text-gray-500 font-light">Calculated over last {report?.monthly_stats.length} months</p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Payout Frequency</p>
            <h3 className="text-2xl font-bold text-white">Annual / Quarterly</h3>
          </div>
          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="text-xs text-gray-500 font-light flex items-center gap-1">
              <CheckCircle2 size={12} className="text-green-500" /> Automated settlement enabled
            </p>
          </div>
        </div>
      </div>

      {/* Income Chart & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simple Visual Chart */}
        <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Income Trend</h3>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">6 Month View</span>
          </div>
          
          <div className="flex items-end justify-between h-48 gap-2 px-2">
            {report?.monthly_stats.map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  className="w-full bg-primary/20 rounded-t-xl group-hover:bg-primary transition-all duration-500 relative cursor-pointer"
                  style={{ height: `${(stat.total / maxIncome) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ₦{stat.total.toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{stat.month}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
              <span className="text-xs text-gray-400 font-light">Highest Month</span>
              <span className="text-xs font-bold text-white">Mar 2024</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
              <span className="text-xs text-gray-400 font-light">Lowest Month</span>
              <span className="text-xs font-bold text-white">Jan 2024</span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.01]">
            <h3 className="font-bold text-white">Transaction History</h3>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Reference ID..." 
                  className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all w-full"
                />
              </div>
              <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <Filter size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Reference</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report?.history.map((pay) => (
                  <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                          <CreditCard size={14} />
                        </div>
                        <span className="text-xs font-bold text-gray-300">#{pay.payment_reference.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-white font-bold">{new Date(pay.payment_date).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-600 uppercase font-black">{new Date(pay.payment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-white text-sm">
                      ₦{pay.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest",
                        pay.status === "SUCCESS" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!report?.history || report.history.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <p className="text-gray-500 font-light">No transaction records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
