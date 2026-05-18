"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Mail, 
  Phone, 
  ShieldCheck, 
  MoreVertical,
  Clock,
  ArrowRight,
  Plus
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  property_count: number;
  status: "ACTIVE" | "PENDING";
}

export default function MyAgentsPage() {
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get<{ active: Agent[], pending: Agent[] }>(ENDPOINTS.PROPERTIES.OWNER_AGENTS);
        setActiveAgents(res.active || []);
        setPendingAgents(res.pending || []);
      } catch (err) {
        console.error("Failed to fetch agents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 w-1/3 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-[2rem]" />)}
        </div>
        <div className="h-96 w-full bg-white/5 rounded-[3rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Management Team</h1>
          <p className="text-gray-500 font-light">Your network of professional real estate managers.</p>
        </div>
        <Link 
          href="/owner/agents/find"
          className="bg-primary text-black px-8 py-4 rounded-2xl font-bold shadow-[0_10px_30px_rgba(193,155,118,0.2)] hover:bg-primary-hover transition-all flex items-center gap-2 group"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" /> 
          Discover Verified Agents
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <UserCheck size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeAgents.length}</p>
          <p className="text-xs text-gray-500 font-light">Certified Managers</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
              <Clock size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pending</span>
          </div>
          <p className="text-3xl font-bold text-white">{pendingAgents.length}</p>
          <p className="text-xs text-gray-500 font-light">Invitations Sent</p>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Security</span>
          </div>
          <p className="text-3xl font-bold text-white">100%</p>
          <p className="text-xs text-primary/60 font-light">Verified Relationship</p>
        </div>
      </div>

      {/* Agents Table/List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-lg font-bold text-white">Active Management</h2>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>

        {activeAgents.length === 0 && pendingAgents.length === 0 ? (
          <div className="p-20 text-center">
            <Users className="w-16 h-16 text-white/5 mx-auto mb-6" />
            <p className="text-gray-500 font-light">No agents found in your network.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Active Agents */}
            {activeAgents.map((agent) => (
              <div key={agent.id} className="p-8 hover:bg-white/[0.03] transition-all group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                      {agent.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg tracking-tight">{agent.full_name}</h4>
                      <div className="flex flex-wrap gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1.5 font-light">
                          <Mail size={12} className="text-primary/40" /> {agent.email}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1.5 font-light">
                          <Phone size={12} className="text-primary/40" /> {agent.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-center lg:text-right space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Properties</p>
                      <p className="text-sm font-bold text-white">{agent.property_count} Managed</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-4 py-2 rounded-xl border border-green-500/10 tracking-widest uppercase">
                        Active
                      </span>
                      <button className="p-2 text-gray-500 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pending Agents */}
            {pendingAgents.map((agent) => (
              <div key={agent.id} className="p-8 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div className="flex items-center gap-6 opacity-60">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-gray-500">
                      ?
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg tracking-tight">Pending Invitation</h4>
                      <span className="text-xs text-gray-500 flex items-center gap-1.5 font-light mt-1">
                        <Mail size={12} /> {agent.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-center lg:text-right space-y-1 opacity-60">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Awaiting Sign-up</p>
                      <p className="text-sm font-bold text-gray-400">1 Property Context</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-primary/5 text-primary text-[10px] font-black px-4 py-2 rounded-xl border border-primary/10 tracking-widest uppercase animate-pulse">
                        Invited
                      </span>
                      <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        Resend <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro Tip */}
      <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex items-center gap-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-white">Trust Framework</h4>
          <p className="text-sm text-gray-500 font-light">Managers only gain access to properties you explicitly assign. You can revoke management rights at any time.</p>
        </div>
      </div>
    </div>
  );
}
