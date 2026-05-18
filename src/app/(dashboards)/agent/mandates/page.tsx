"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  ArrowUpRight,
  Search,
  Users,
  LayoutGrid,
  List as ListIcon,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Loader2,
  ShieldCheck,
  XCircle
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  status: string;
  listing_type: string;
  type: string;
  agent_assignment_status: string;
  images: { image_url: string }[];
  owner?: { id: string; profile: { full_name: string }; email: string };
}

interface DashboardData {
  active_mandates: Property[];
  pending_mandates: Property[];
  total_managed?: number;
}

export default function AgentMandatesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [processingMandateId, setProcessingMandateId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMandates = async () => {
      try {
        const res = await api.get<DashboardData>(ENDPOINTS.AGENT.SUMMARY);
        // Combine both active and pending mandates for the full inventory view
        const all = [...(res.active_mandates || []), ...(res.pending_mandates || [])];
        setProperties(all);
      } catch (err) {
        console.error("Failed to fetch mandates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMandates();
  }, []);

  const pendingMandates = properties.filter(p => p.agent_assignment_status === "PENDING");
  const activeMandates = properties.filter(p => p.agent_assignment_status !== "PENDING");

  const filtered = activeMandates.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptMandate = async (id: string) => {
    setProcessingMandateId(id);
    try {
      await api.post<null>(ENDPOINTS.AGENT.ACCEPT_MANDATE(id), {});
      setProperties((current) =>
        current.map((property) =>
          property.id === id ? { ...property, agent_assignment_status: "ACCEPTED" } : property
        )
      );
      toast.success("Mandate accepted! You now manage this property.");
    } catch (err) {
      console.error("Failed to accept mandate", err);
      toast.error("Failed to accept mandate.");
    } finally {
      setProcessingMandateId(null);
    }
  };

  const updateSaleStatus = async (propertyId: string, status: string) => {
    setUpdatingStatusId(propertyId);
    try {
      const updated = await api.patch<Property>(`/properties/${propertyId}/sale-status`, { status });
      setProperties((current) => current.map((property) => property.id === propertyId ? updated : property));
    } catch (err) {
      console.error("Failed to update sale status", err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getSaleActions = (status: string) => {
    if (status === "RESERVED") {
      return [
        { label: "Start Review", status: "UNDER_REVIEW", icon: ShieldAlert },
        { label: "Cancel", status: "CANCELLED", icon: RotateCcw },
      ];
    }
    if (status === "UNDER_REVIEW") {
      return [
        { label: "Confirm Sold", status: "SOLD", icon: CheckCircle2 },
        { label: "Back to Reserved", status: "RESERVED", icon: RotateCcw },
      ];
    }
    if (status === "CANCELLED") {
      return [{ label: "Reopen", status: "AVAILABLE", icon: RotateCcw }];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 w-1/3 bg-white/5 rounded-2xl" />
        <div className="h-16 w-full bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Active Mandates</h1>
          <p className="text-gray-500 font-light text-lg">Review new offers and manage properties under your professional care.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-primary text-black" : "text-gray-500 hover:text-white")}><LayoutGrid size={18} /></button>
          <button onClick={() => setViewMode("list")} className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-primary text-black" : "text-gray-500 hover:text-white")}><ListIcon size={18} /></button>
        </div>
      </div>

      {pendingMandates.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" size={20} />
              <h2 className="text-xl font-bold text-white tracking-tight">New Mandate Offers</h2>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {pendingMandates.length} awaiting response
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingMandates.map((prop) => (
              <div
                key={prop.id}
                className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <Building2 size={28} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-white truncate">{prop.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                      <MapPin size={12} /> {prop.location || "Location pending"}
                    </p>
                    <p className="text-primary font-bold text-xs">
                      NGN {prop.price?.toLocaleString()} Annual Value
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col sm:flex-row lg:w-auto gap-3">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold text-sm hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2">
                    <XCircle size={18} /> Decline
                  </button>
                  <button
                    disabled={processingMandateId === prop.id}
                    onClick={() => handleAcceptMandate(prop.id)}
                    className="w-full sm:w-auto px-10 py-4 bg-primary text-black rounded-2xl font-black text-sm hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-70"
                  >
                    {processingMandateId === prop.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Accept Mandate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search mandates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className={cn("grid gap-6", viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
        {filtered.map((prop) => {
          const isPending = prop.agent_assignment_status === "PENDING";
          return (
            <div
              key={prop.id}
              className={cn(
                "bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.04] transition-all group relative",
                viewMode === "list" ? "flex flex-col md:flex-row" : "",
                isPending && "border-primary/30 shadow-[0_0_40px_rgba(193,155,118,0.05)]"
              )}
            >
              <Link href={`/agent/mandates/${prop.id}`} className={cn("relative bg-white/5 overflow-hidden block", viewMode === "list" ? "w-full md:w-64 h-48 shrink-0" : "w-full h-56")}>
                {prop.images && prop.images.length > 0 ? (
                  <img src={prop.images[0].image_url} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600"><Building2 size={40} /></div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={cn("text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest backdrop-blur-md border", prop.status === "AVAILABLE" ? "bg-green-500/20 text-green-400 border-green-500/20" : "bg-primary/20 text-primary border-primary/20")}>{prop.status}</span>
                  {isPending && <span className="text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest bg-primary text-black animate-pulse flex items-center gap-1"><ShieldAlert size={10} /> Pending</span>}
                </div>
              </Link>

              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <Link href={`/agent/mandates/${prop.id}`} className="space-y-1 hover:text-primary transition-colors">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{prop.type || "Asset"}</p>
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-primary transition-colors">{prop.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 font-light"><MapPin size={12} className="text-primary/60" /> {prop.location || "Address Private"}</p>
                  </Link>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">NGN {prop.price?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400"><Users size={14} /><span className="text-xs font-medium">No Tenant</span></div>
                  </div>
                  <div className="flex gap-2">
                    {prop.owner && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/messages?userId=${prop.owner?.id}`;
                        }}
                        className="p-3 bg-white/5 text-gray-400 hover:text-primary hover:bg-white/10 rounded-xl transition-all"
                        title="Message Owner"
                      >
                        <MessageSquare size={16} />
                      </button>
                    )}
                    <Link
                      href={`/agent/mandates/${prop.id}`}
                      className={cn("px-6 py-3 text-xs font-black rounded-xl transition-all flex items-center gap-2", isPending ? "bg-white/10 text-white" : "bg-primary text-black")}
                    >
                      {isPending ? "Review Offer" : "Manage"} <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
                {prop.listing_type === "SALE" && getSaleActions(prop.status).length > 0 && (
                  <div className="pt-5 border-t border-white/5 space-y-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Sale Workflow</p>
                    <div className="flex flex-wrap gap-3">
                      {getSaleActions(prop.status).map((action) => (
                        <button
                          key={action.status}
                          onClick={() => updateSaleStatus(prop.id, action.status)}
                          disabled={updatingStatusId === prop.id}
                          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-xs font-bold text-white hover:bg-primary hover:text-black transition-all disabled:opacity-60"
                        >
                          {updatingStatusId === prop.id ? <Loader2 size={14} className="animate-spin" /> : <action.icon size={14} />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
