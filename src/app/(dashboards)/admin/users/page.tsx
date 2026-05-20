"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Building,
  CheckCircle2,
  Loader2,
  Mail,
  Search,
  Shield,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "AGENT" | "OWNER" | "TENANT";
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  created_at: string;
  profile?: {
    full_name?: string;
    agency_name?: string;
  };
}

const roles = ["ALL", "SUPER_ADMIN", "AGENT", "OWNER", "TENANT"];
const statuses = ["ALL", "ACTIVE", "PENDING", "SUSPENDED"];

const formatRole = (role: string) => role.replaceAll("_", " ");
const initials = (name?: string, email?: string) => (name || email || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingID, setUpdatingID] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<AdminUser[]>(ENDPOINTS.ADMIN.USERS, {
        search,
        role,
        status,
      });
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, role, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      queueMicrotask(() => {
        fetchUsers();
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchUsers]);

  const roleSummary = useMemo(() => {
    return users.reduce<Record<string, number>>((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  const updateStatus = async (id: string, nextStatus: AdminUser["status"]) => {
    setUpdatingID(id);
    try {
      await api.patch(ENDPOINTS.ADMIN.USER_STATUS(id), { status: nextStatus });
      toast.success("User status updated.");
      await fetchUsers();
    } catch (err) {
      console.error("Failed to update user status", err);
      toast.error("Failed to update user status.");
    } finally {
      setUpdatingID(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">User Management</h1>
          <p className="text-gray-500 font-light">Monitor platform accounts, agent approvals, suspensions, and role distribution.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Search name, email, agency..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {roles.map((item) => <option key={item} value={item}>{formatRole(item)}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {statuses.map((item) => <option key={item} value={item}>{formatRole(item)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Admins", count: roleSummary.SUPER_ADMIN || 0, icon: Shield, color: "text-blue-500" },
          { label: "Agents", count: roleSummary.AGENT || 0, icon: Briefcase, color: "text-primary" },
          { label: "Owners", count: roleSummary.OWNER || 0, icon: Building, color: "text-green-500" },
          { label: "Tenants", count: roleSummary.TENANT || 0, icon: UserIcon, color: "text-orange-500" },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] flex items-center gap-6">
            <div className={cn("p-4 rounded-2xl bg-white/5", item.color)}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
              <h3 className="text-2xl font-bold font-heading">{item.count}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.map((user) => {
                const name = user.profile?.full_name || user.email;
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {initials(name, user.email)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{name}</p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Mail size={10} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter border",
                        user.role === "SUPER_ADMIN" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          user.role === "AGENT" ? "bg-primary/10 text-primary border-primary/20" :
                            user.role === "OWNER" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                              "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      )}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-1.5">
                        {user.status === "ACTIVE" ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                        <span className={cn(
                          "text-xs font-medium",
                          user.status === "ACTIVE" ? "text-green-500" :
                            user.status === "PENDING" ? "text-orange-500" :
                              "text-red-500"
                        )}>
                          {formatRole(user.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-end gap-2">
                        {user.status !== "ACTIVE" && (
                          <button
                            disabled={updatingID === user.id}
                            onClick={() => updateStatus(user.id, "ACTIVE")}
                            className="bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-hover disabled:opacity-60"
                          >
                            Activate
                          </button>
                        )}
                        {user.status !== "SUSPENDED" && user.role !== "SUPER_ADMIN" && (
                          <button
                            disabled={updatingID === user.id}
                            onClick={() => updateStatus(user.id, "SUSPENDED")}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white disabled:opacity-60"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-500">No users match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
