"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, FileText, Loader2, Mail, Phone, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  profile?: {
    full_name?: string;
    phone_number?: string;
    agency_name?: string;
    license_number?: string;
  };
}

const initials = (name?: string, email?: string) => {
  const value = name || email || "Agent";
  return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
};

export default function AgentApprovalsPage() {
  const [pendingAgents, setPendingAgents] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingID, setUpdatingID] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await api.get<AdminUser[]>(ENDPOINTS.ADMIN.PENDING_AGENTS);
      setPendingAgents(data || []);
    } catch (err) {
      console.error("Failed to load pending agents", err);
      toast.error("Failed to load pending agent approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchAgents();
    });
  }, [fetchAgents]);

  const updateStatus = async (id: string, status: "ACTIVE" | "SUSPENDED") => {
    setUpdatingID(id);
    try {
      await api.patch(ENDPOINTS.ADMIN.USER_STATUS(id), { status });
      toast.success(status === "ACTIVE" ? "Agent approved." : "Agent rejected.");
      await fetchAgents();
    } catch (err) {
      console.error("Failed to update agent status", err);
      toast.error("Failed to update agent status.");
    } finally {
      setUpdatingID(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-heading">Agent Approvals</h1>
        <p className="text-gray-500 font-light">Verify new estate agents before they can fully operate on the platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingAgents.map((agent) => {
          const name = agent.profile?.full_name || agent.email;
          return (
            <div key={agent.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 md:p-8 hover:bg-white/[0.04] transition-all group">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    {initials(name, agent.email)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{agent.profile?.agency_name || "Agency name pending"}</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Mail size={12} className="text-primary" /> {agent.email}
                      </span>
                      {agent.profile?.phone_number && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone size={12} className="text-primary" /> {agent.profile.phone_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 xl:border-l xl:border-white/5 xl:pl-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">License Number</p>
                    <p className="text-sm font-mono text-gray-200">{agent.profile?.license_number || "Not provided"}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-xs font-bold text-gray-300">
                    <FileText size={16} className="text-primary" />
                    Profile review
                  </div>
                </div>

                <div className="flex gap-4 w-full xl:w-auto">
                  <button
                    disabled={updatingID === agent.id}
                    onClick={() => updateStatus(agent.id, "ACTIVE")}
                    className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-primary text-black px-7 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-60"
                  >
                    {updatingID === agent.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                    Approve
                  </button>
                  <button
                    disabled={updatingID === agent.id}
                    onClick={() => updateStatus(agent.id, "SUSPENDED")}
                    className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-7 py-4 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all disabled:opacity-60"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-between gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <span>Request Date: {new Date(agent.created_at).toLocaleDateString()}</span>
                <span className="text-primary/60 italic">Verification Required</span>
              </div>
            </div>
          );
        })}

        {pendingAgents.length === 0 && (
          <div className="py-24 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
            <p className="text-gray-500 font-light italic">No pending agent approvals at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
