"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  UserPlus,
  Briefcase,
  Building2,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import { AssignAgentModal } from "@/components/properties/assign-agent-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  email: string;
  profile: {
    full_name: string;
    agency_name: string;
    bio: string;
    nationality: string;
    license_number: string;
    specialties: string; // Comma separated
    rating: number;
    review_count: number;
  };
}

export default function AgentDiscoveryPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<{ id: string; email: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.get<Agent[]>(ENDPOINTS.AUTH.VERIFIED_AGENTS);
        setAgents(data || []);
      } catch (err) {
        toast.error("Failed to load agent directory.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const filtered = agents.filter(a => 
    a.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.profile.agency_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.profile.specialties?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openInviteModal = (agent: Agent) => {
    setSelectedAgent({ id: agent.id, email: agent.email });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 w-1/3 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-white/5 rounded-[3rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Verified Agents</h1>
          <p className="text-gray-500 font-light text-lg">Partner with certified professionals to manage your assets.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, agency, or specialty (e.g. Luxury, Commercial)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] py-6 pl-16 pr-6 text-base focus:outline-none focus:border-primary/50 transition-all shadow-2xl"
          />
        </div>
        <button className="px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 font-bold shadow-xl">
          <Filter size={20} /> Advanced Filters
        </button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((agent) => {
          const tags = agent.profile.specialties ? agent.profile.specialties.split(",") : ["Residential", "Agent"];
          const rating = agent.profile.rating || 0;
          
          return (
            <div key={agent.id} className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 hover:bg-white/[0.04] transition-all group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl relative group-hover:scale-110 transition-transform">
                    {agent.profile.full_name.charAt(0)}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#0A0A0A] rounded-full flex items-center justify-center">
                      <ShieldCheck size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1.5 rounded-full text-yellow-500">
                    <Star size={14} fill={rating > 0 ? "currentColor" : "none"} />
                    <span className="text-xs font-black">{rating > 0 ? rating.toFixed(1) : "New"}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{agent.profile.full_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                    <Building2 size={14} className="text-primary/60" /> {agent.profile.agency_name || "Independent Professional"}
                  </p>
                </div>

                <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-3">
                  {agent.profile.bio || "This professional agent is a verified member of our real estate network, committed to providing exceptional management services."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                      {tag.trim()}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-green-500/5 rounded-lg text-[10px] font-bold text-green-500/60 uppercase tracking-tighter">Verified</span>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
                <button 
                  onClick={() => router.push(`/messages?userId=${agent.id}`)}
                  className="flex-1 bg-white/5 text-white text-xs font-black py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Chat
                </button>
                <button 
                  onClick={() => openInviteModal(agent)}
                  className="flex-1 bg-primary text-black text-xs font-black py-4 rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} /> Recruit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-32 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem]">
          <Briefcase className="w-16 h-16 text-white/5 mx-auto mb-6" />
          <p className="text-gray-500 font-light">No verified agents found matching your search.</p>
        </div>
      )}

      {/* Modal */}
      <AssignAgentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialEmail={selectedAgent?.email || ""}
        agentId={selectedAgent?.id || null}
      />
    </div>
  );
}
