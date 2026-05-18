import { 
  Users, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  FileClock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

const stats = [
  { 
    label: "Total Users", 
    value: "2,543", 
    change: "+12.5%", 
    trend: "up", 
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  { 
    label: "Active Listings", 
    value: "864", 
    change: "+5.2%", 
    trend: "up", 
    icon: Building2,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  { 
    label: "Total Revenue", 
    value: "$1.2M", 
    change: "-2.4%", 
    trend: "down", 
    icon: Wallet,
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  { 
    label: "Pending Approvals", 
    value: "14", 
    change: "3 New", 
    trend: "neutral", 
    icon: FileClock,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">System Overview</h1>
          <p className="text-gray-500 font-light">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all">
            Download Report
          </button>
          <button className="bg-primary text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
            + New Property
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] space-y-6 hover:bg-white/[0.05] transition-all group">
            <div className="flex justify-between items-start">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend === "up" ? "bg-green-500/10 text-green-500" : 
                stat.trend === "down" ? "bg-red-500/10 text-red-500" : 
                "bg-gray-500/10 text-gray-500"
              }`}>
                {stat.change}
                {stat.trend === "up" && <ArrowUpRight size={14} />}
                {stat.trend === "down" && <ArrowDownRight size={14} />}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold font-heading mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tables/Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Agents for Approval */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-bold font-heading">Pending Agent Approvals</h3>
            <Link href="/admin/approvals" className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              View All <ExternalLink size={14} />
            </Link>
          </div>
          <div className="p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-4 py-4">Agent Name</th>
                  <th className="px-4 py-4">Agency</th>
                  <th className="px-4 py-4">Joined</th>
                  <th className="px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Robert Fox", agency: "Fox Realty", date: "2 hours ago" },
                  { name: "Jane Cooper", agency: "Prime Estates", date: "5 hours ago" },
                  { name: "Cody Fisher", agency: "Urban Living", date: "Yesterday" },
                  { name: "Esther Howard", agency: "Skyline Homes", date: "2 days ago" },
                ].map((agent, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-sm text-gray-400">{agent.agency}</td>
                    <td className="px-4 py-6 text-sm text-gray-400">{agent.date}</td>
                    <td className="px-4 py-6 text-right">
                      <button className="text-[10px] font-bold bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-full hover:bg-primary hover:text-black transition-all">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold font-heading mb-8">System Activity</h3>
            <div className="space-y-8">
              {[
                { title: "Property Leased", desc: "Villa Marittima leased to Alice Smith", time: "12m ago", color: "bg-primary" },
                { title: "Payment Received", desc: "$12,500 rent for 42nd Ave Penthouse", time: "45m ago", color: "bg-green-500" },
                { title: "Maintenance Request", desc: "Plumbing issue reported in Unit 4B", time: "1h ago", color: "bg-red-500" },
                { title: "New User Signed Up", desc: "Mark Johnson registered as Owner", time: "3h ago", color: "bg-blue-500" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 3 && <div className="absolute left-1.5 top-6 bottom-[-32px] w-[2px] bg-white/5"></div>}
                  <div className={`w-3 h-3 rounded-full ${activity.color} mt-1.5 flex-shrink-0 z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{activity.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{activity.desc}</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
