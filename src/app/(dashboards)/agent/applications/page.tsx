import {
  Users,
  Search,
  Filter,
  FileCheck,
  FileText,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

const applications = [
  {
    id: "APP-001",
    tenant: "Alice Smith",
    property: "Villa Marittima",
    occupation: "Software Engineer",
    income: "₦850k / month",
    status: "Under Review",
    ninVerified: true,
    joined: "2 hours ago"
  },
  {
    id: "APP-002",
    tenant: "John Doe",
    property: "Modernist Retreat",
    occupation: "Medical Doctor",
    income: "₦1.2M / month",
    status: "Pending Documents",
    ninVerified: true,
    joined: "5 hours ago"
  },
  {
    id: "APP-003",
    tenant: "Sarah Connor",
    property: "Glass House",
    occupation: "Digital Marketer",
    income: "₦600k / month",
    status: "Rejected",
    ninVerified: false,
    joined: "Yesterday"
  }
];

export default function AgentApplicationsPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-heading">Lease Applications</h1>
        <p className="text-gray-500 font-light">Review tenant applications and verify KYC documents before lease approval.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search applications..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all">
          <Filter size={18} className="text-gray-400" /> Filter
        </button>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all group">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

              {/* Tenant Profile */}
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {app.tenant.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{app.tenant}</h3>
                  <p className="text-xs text-gray-500">{app.occupation} • {app.income}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${app.ninVerified ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                      {app.ninVerified ? "NIN Verified" : "NIN Pending"}
                    </span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase">{app.joined}</span>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="flex flex-col lg:border-l lg:border-white/5 lg:pl-8 space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Applied For</p>
                <p className="text-sm font-bold text-white">{app.property}</p>
                <Link href="#" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-tighter flex items-center gap-1">
                  View Property Details <ChevronRight size={12} />
                </Link>
              </div>

              {/* Verification Documents */}
              <div className="flex gap-4">
                <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <FileText size={14} className="text-primary/60" />
                  Work ID
                </button>
                <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <FileCheck size={14} className="text-primary/60" />
                  NIN Slip
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full lg:w-auto">
                <button className="flex-1 lg:flex-none p-4 rounded-xl bg-primary text-black hover:bg-primary-hover transition-all">
                  <CheckCircle size={20} />
                </button>
                <button className="flex-1 lg:flex-none p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                  <XCircle size={20} />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
