"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, 
  CreditCard,
  Wrench, 
  Calendar, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock,
  Loader2,
  Home,
  TrendingUp,
  PieChart as PieIcon,
  Activity
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardData {
  lease: {
    id: string;
    start_date: string;
    end_date: string;
    rent_amount: number;
    status: string;
    tenant_accepted?: boolean;
  };
  property: {
    id: string;
    title: string;
    location: string;
    images: { image_url: string }[];
  };
  maintenance: {
    title: string;
    status: string;
    priority?: string;
    created_at: string;
  }[];
  payments: {
    amount: number;
    created_at: string;
  }[];
  wallet: {
    balance: number;
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
    location: string;
  };
}

interface Invoice {
  id: string;
  amount: number;
  type: string;
  status: string;
  due_date?: string | null;
  paid_at?: string | null;
  description?: string;
  property?: {
    id: string;
    title: string;
    location?: string;
  };
  lease?: {
    id: string;
    status: string;
    tenant_accepted?: boolean;
  } | null;
}

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

type FeedItem =
  | DashboardData["payments"][number]
  | DashboardData["maintenance"][number];

const isPaymentFeedItem = (item: FeedItem): item is DashboardData["payments"][number] => {
  return "amount" in item;
};

export default function TenantDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardRes, requestRes, invoiceRes] = await Promise.allSettled([
          api.get<DashboardData>(ENDPOINTS.TENANT.DASHBOARD),
          api.get<LeaseRequest[]>("/tenant/lease-requests"),
          api.get<Invoice[]>("/tenant/invoices"),
        ]);

        if (dashboardRes.status === "fulfilled") {
          setData(dashboardRes.value);
        }
        if (requestRes.status === "fulfilled") {
          setLeaseRequests(requestRes.value || []);
        }
        if (invoiceRes.status === "fulfilled") {
          setInvoices(invoiceRes.value || []);
        }
      } catch (err) {
        console.error("Failed to fetch tenant dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    const pendingInvoices = invoices.filter((invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE");
    const approvedRequests = leaseRequests.filter((request) => request.status === "APPROVED");
    const paidLeaseInvoices = invoices.filter((invoice) => invoice.type === "RENT" && invoice.status === "PAID");
    const recentRequests = leaseRequests.slice(0, 3);

    return (
      <div className="py-20 text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-700">
          <Home size={48} />
        </div>
        <div className="max-w-md mx-auto space-y-4">
          <h1 className="text-3xl font-bold font-heading">Welcome Home!</h1>
          <p className="text-gray-500 font-light leading-relaxed">
            You don&apos;t have an active lease linked to your account yet. Ready to find your perfect place?
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6">
          {[
            { label: "Verified Listings", value: "2,500+", icon: ShieldCheck },
            { label: "Secure Payments", value: "100%", icon: Wallet },
            { label: "Fast Support", value: "24/7", icon: Activity }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center space-y-2">
              <stat.icon size={24} className="text-primary mx-auto mb-2 opacity-50" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        <Link 
          href="/properties" 
          className="inline-flex items-center gap-2 bg-primary text-black px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
        >
          Explore Properties <ArrowUpRight size={18} />
        </Link>

        {(recentRequests.length > 0 || pendingInvoices.length > 0 || approvedRequests.length > 0 || paidLeaseInvoices.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto px-6 text-left">
            <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white">Lease Requests</h2>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{leaseRequests.length} total</span>
              </div>
              {recentRequests.length > 0 ? recentRequests.map((request) => (
                <div key={request.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white">{request.property?.title || "Rental Property"}</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    request.status === "APPROVED" ? "bg-green-500/10 text-green-500" :
                    request.status === "REJECTED" ? "bg-red-500/10 text-red-500" :
                    "bg-primary/10 text-primary"
                  )}>
                    {request.status}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-gray-600 py-6 text-center">No lease requests yet.</p>
              )}
              <Link href="/tenant/leases" className="inline-flex items-center justify-center w-full bg-white/5 text-white px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                View Lease Timeline
              </Link>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white">Pending Invoices</h2>
                <CreditCard size={18} className="text-primary" />
              </div>
              {pendingInvoices.length > 0 ? pendingInvoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white">{invoice.type.replaceAll("_", " ")}</p>
                    <p className="text-xs text-gray-500 mt-1">{invoice.property?.title || "Property invoice"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{formatCurrency(invoice.amount)}</p>
                    {invoice.due_date && <p className="text-[10px] text-gray-500">Due {new Date(invoice.due_date).toLocaleDateString()}</p>}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-600 py-6 text-center">No rent invoices waiting for payment.</p>
              )}
              {pendingInvoices.length > 0 && (
                <Link href="/tenant/payments" className="inline-flex items-center justify-center w-full bg-white text-black px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all">
                  Pay Invoices
                </Link>
              )}
              {pendingInvoices.length === 0 && paidLeaseInvoices.length > 0 && (
                <Link href="/tenant/leases" className="inline-flex items-center justify-center w-full bg-white text-black px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all">
                  Review Lease Documents
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const activeRequests = data.maintenance.filter(r => r.status !== "RESOLVED").length;

  // Prepare Chart Data
  const paymentData = data.payments.map(p => ({
    date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: p.amount
  })).reverse();

  const maintenanceStats = [
    { name: 'Active', value: data.maintenance.filter(m => m.status !== 'RESOLVED').length, color: '#C19B76' },
    { name: 'Resolved', value: data.maintenance.filter(m => m.status === 'RESOLVED').length, color: '#10B981' }
  ];

  // Lease Progress Calculation
  const start = new Date(data.lease.start_date).getTime();
  const end = new Date(data.lease.end_date).getTime();
  const now = new Date().getTime();
  const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight leading-tight">Home Analytics</h1>
          <p className="text-gray-500 font-light">Real-time insights for your residence at {data.property.title}.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/tenant/wallet" className="bg-primary/10 border border-primary/20 text-primary px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-primary/20 transition-all">
            <Wallet size={18} /> Fund Wallet
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Next Rent Due", value: formatCurrency(data.lease.rent_amount), sub: `In ${daysRemaining} days`, icon: Calendar, color: "text-primary" },
          { label: "Pending Repairs", value: activeRequests, sub: "Open requests", icon: Wrench, color: "text-blue-500" },
          { label: "Wallet Balance", value: formatCurrency(data.wallet.balance), sub: "Available funds", icon: Wallet, color: "text-primary" },
          { label: "Lease Status", value: data.lease.status, sub: data.lease.tenant_accepted ? "Documents accepted" : "Awaiting documents", icon: Activity, color: "text-purple-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.05] transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className={cn("p-4 rounded-2xl bg-white/5", stat.color)}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold font-heading text-white">{stat.value}</h3>
            <p className="text-xs text-gray-600 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <Link href="/tenant/leases" className="block bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 group hover:bg-white/[0.04] transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Lease Overview</h3>
              <p className="text-xs text-gray-500 mt-2">
                {data.lease.status === "ACTIVE"
                  ? "Your lease is active. Review lease files, renewal dates, and acknowledgement status."
                  : "Your rent is paid. Review uploaded documents and acknowledge them to activate the lease."}
              </p>
            </div>
          </div>
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            data.lease.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
          )}>
            {data.lease.status}
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:gap-3 transition-all">
            Manage leases <ArrowUpRight size={14} />
          </span>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Analytics Card */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-heading text-white flex items-center gap-3">
                  <TrendingUp size={20} className="text-primary" /> Payment History
                </h3>
                <p className="text-xs text-gray-500">Tracking your last rent and utility transactions.</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black text-gray-400">
                LATEST TRENDS <Activity size={12} className="text-primary animate-pulse" />
              </div>
            </div>

            <div className="h-[350px] w-full">
              {paymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={paymentData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C19B76" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C19B76" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#4b5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `NGN ${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '1rem', fontSize: '12px' }}
                      itemStyle={{ color: '#C19B76' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#C19B76" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-700 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                   <div className="text-center space-y-2">
                     <TrendingUp size={48} className="mx-auto opacity-20" />
                     <p className="text-sm font-light">Initial data is being synchronized...</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/20 via-black to-black border border-white/10 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-primary/30 transition-all">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-2xl font-bold font-heading text-white">Your Financial Journey</h3>
              <p className="text-sm text-gray-400 font-light max-w-md">
                You&apos;re building the capital needed to transition from tenant to homeowner. Keep your financial profile updated for accurate timelines.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <ShieldCheck size={14} /> PCI-DSS SECURE
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <TrendingUp size={14} /> SMART PREDICTIONS
                </div>
              </div>
            </div>
            <Link href="/tenant/settings" className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-[2rem] hover:bg-primary transition-all whitespace-nowrap shadow-xl">
              Update Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-8">
                <div className="space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <PieIcon size={18} className="text-primary" /> Repair Status
                  </h4>
                  <p className="text-xs text-gray-500">Maintenance ticket distribution.</p>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={maintenanceStats}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {maintenanceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '1rem', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6">
                   {maintenanceStats.map((s, i) => (
                     <div key={i} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.name}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-green-500" /> Compliance Status
                  </h4>
                  <p className="text-xs text-gray-500">Your account safety and verification.</p>
                </div>
                
                <div className="space-y-4 py-6">
                   {[
                     { label: "ID Verification", status: "Verified" },
                     { label: "Lease Signed", status: data.lease.tenant_accepted ? "Accepted" : "Pending" },
                     { label: "Insurance", status: "N/A" }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xs text-gray-400">{item.label}</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.status}</span>
                     </div>
                   ))}
                </div>

                <Link href="/settings" className="w-full py-4 text-center text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest bg-white/5 rounded-xl">
                  Update Documents
                </Link>
             </div>
          </div>
        </div>

        {/* Right Column: Lease Details & Activity */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-8">
            <h3 className="text-xl font-bold font-heading text-white">Lease Progress</h3>
            
            <div className="space-y-6">
              <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Time Remaining</p>
                  <p className="text-2xl font-bold text-white">{daysRemaining} Days</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Elapsed</p>
                  <p className="text-2xl font-bold text-gray-400">{Math.round(progress)}%</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Starts</p>
                    <p className="text-sm font-bold text-white">{new Date(data.lease.start_date).toLocaleDateString()}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-500/50">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ends</p>
                    <p className="text-sm font-bold text-white">{new Date(data.lease.end_date).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            <button className="w-full py-5 bg-primary text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-hover transition-all">
              Request Renewal
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8">
            <h3 className="text-xl font-bold font-heading mb-10 flex items-center gap-3 text-white">
              <Activity size={20} className="text-primary" /> Live Feed
            </h3>
            <div className="space-y-10">
              {data.payments.length === 0 && data.maintenance.length === 0 ? (
                <p className="text-sm text-gray-600 italic text-center py-10">No recent activity detected.</p>
              ) : (
                ([...data.payments.slice(0, 2), ...data.maintenance.slice(0, 2)] as FeedItem[]).map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-colors",
                      isPaymentFeedItem(item) ? "text-green-500" : "text-blue-500"
                    )}>
                      {isPaymentFeedItem(item) ? <Wallet size={20} /> : <Wrench size={20} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                        {isPaymentFeedItem(item) ? "Payment Logged" : `Repair: ${item.title}`}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
