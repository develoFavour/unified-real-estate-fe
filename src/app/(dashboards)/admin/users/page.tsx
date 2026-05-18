import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  User as UserIcon, 
  Briefcase, 
  Building,
  Mail,
  CheckCircle2,
  XCircle
} from "lucide-react";

const users = [
  { id: "1", name: "Favour Opia", email: "favour@example.com", role: "Super Admin", status: "Active", joined: "12 May 2024" },
  { id: "2", name: "Robert Fox", email: "robert@foxrealty.com", role: "Agent", status: "Active", joined: "15 May 2024" },
  { id: "3", name: "Alice Smith", email: "alice@tenant.com", role: "Tenant", status: "Active", joined: "20 May 2024" },
  { id: "4", name: "Mark Johnson", email: "mark@owner.com", role: "Owner", status: "Active", joined: "22 May 2024" },
  { id: "5", name: "Jane Cooper", email: "jane@prime.com", role: "Agent", status: "Pending", joined: "25 May 2024" },
  { id: "6", name: "Cody Fisher", email: "cody@urban.com", role: "Agent", status: "Suspended", joined: "28 May 2024" },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">User Management</h1>
          <p className="text-gray-500 font-light">Monitor system access, manage roles, and track user growth.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search name, email..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Filter size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Role Distribution Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Admins", count: "2", icon: Shield, color: "text-blue-500" },
          { label: "Agents", count: "45", icon: Briefcase, color: "text-primary" },
          { label: "Owners", count: "128", icon: Building, color: "text-green-500" },
          { label: "Tenants", count: "1,240", icon: UserIcon, color: "text-orange-500" },
        ].map((role, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-white/5 ${role.color}`}>
              <role.icon size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{role.label}</p>
              <h3 className="text-2xl font-bold font-heading">{role.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Mail size={10} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter border ${
                      user.role === "Super Admin" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      user.role === "Agent" ? "bg-primary/10 text-primary border-primary/20" :
                      user.role === "Owner" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      "bg-orange-500/10 text-orange-500 border-orange-500/20"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-400">{user.joined}</td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-1.5">
                      {user.status === "Active" ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                      <span className={`text-xs font-medium ${
                        user.status === "Active" ? "text-green-500" : 
                        user.status === "Pending" ? "text-orange-500" : 
                        "text-red-500"
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500">
                      <MoreVertical size={20} />
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
