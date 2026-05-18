import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  Download,
  Calendar,
  ChevronRight
} from "lucide-react";

const transactions = [
  { id: "TX-9082", user: "Alice Smith", property: "Villa Marittima", amount: "$12,500", date: "Today", status: "Completed" },
  { id: "TX-9081", user: "David Chen", property: "Oceanfront Penthouse", amount: "$15,200", date: "Yesterday", status: "Completed" },
  { id: "TX-9080", user: "John Doe", property: "Glass House", amount: "$4,000", date: "2 days ago", status: "Pending" },
  { id: "TX-9079", user: "Sarah Connor", property: "Modernist Retreat", amount: "$8,900", date: "3 days ago", status: "Failed" },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Financial Reports</h1>
          <p className="text-gray-500 font-light">Comprehensive overview of revenue, commissions, and platform transactions.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all">
            <Calendar size={16} className="text-primary" /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 bg-primary text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Revenue", value: "$1,452,000", change: "+12.5%", trend: "up", icon: DollarSign },
          { label: "Commission Earned", value: "$86,400", change: "+8.2%", trend: "up", icon: TrendingUp },
          { label: "Active Subscriptions", value: "$42,100", change: "-2.4%", trend: "down", icon: Wallet },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex justify-between items-start">
              <div className="p-4 rounded-2xl bg-white/5 text-primary">
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}>
                {stat.change} {stat.trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold font-heading mt-2">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder (Simplified Visual) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold font-heading">Revenue Growth</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-primary rounded-full"></div> Gross
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-white/20 rounded-full"></div> Commission
            </div>
          </div>
        </div>
        
        <div className="h-64 flex items-end gap-4 md:gap-8 pb-4 border-b border-white/5">
          {[40, 70, 45, 90, 65, 80, 100, 55, 85, 95, 60, 75].map((h, i) => (
            <div key={i} className="flex-1 group relative">
              <div 
                className="w-full bg-white/5 rounded-t-lg group-hover:bg-primary/20 transition-all duration-500 relative flex flex-col justify-end overflow-hidden" 
                style={{ height: `${h}%` }}
              >
                <div className="w-full bg-primary/40 h-1/3 group-hover:h-1/2 transition-all duration-500"></div>
              </div>
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 font-bold uppercase">M{i+1}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold font-heading">Recent Transactions</h3>
          <button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
            View All Transactions <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-6 font-mono text-xs text-gray-400">{tx.id}</td>
                  <td className="px-6 py-6 text-sm font-bold text-white">{tx.user}</td>
                  <td className="px-6 py-6 text-sm text-gray-400">{tx.property}</td>
                  <td className="px-6 py-6 text-sm font-bold text-primary">{tx.amount}</td>
                  <td className="px-6 py-6">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                      tx.status === "Completed" ? "bg-green-500/10 text-green-500" :
                      tx.status === "Pending" ? "bg-orange-500/10 text-orange-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-primary">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
