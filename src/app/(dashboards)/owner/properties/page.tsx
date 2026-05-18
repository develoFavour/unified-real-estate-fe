"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  ShieldCheck,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import { AssignAgentModal } from "@/components/properties/assign-agent-modal";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  status: string;
  listing_type: string;
  mandate_type: string;
  agent_id?: string;
  images?: { image_url: string }[];
}

export default function MyPortfolioPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<{ id: string, title: string } | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Property[]>(ENDPOINTS.PROPERTIES.ME);
      setProperties(data || []);
    } catch (err) {
      setError("Failed to load your portfolio. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchPortfolio();
    });
  }, []);

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        { label: "Start Review", status: "UNDER_REVIEW", icon: ShieldCheck },
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
        <div className="h-12 w-full bg-white/5 rounded-xl" />
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 w-full bg-white/5 rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">My Portfolio</h1>
          <p className="text-gray-500 font-light">Precision management of your real estate assets.</p>
        </div>
        <Link href="/owner/properties/new" className="w-full sm:w-auto justify-center bg-primary text-black px-6 sm:px-8 py-4 rounded-2xl font-bold shadow-[0_10px_30px_rgba(193,155,118,0.2)] hover:bg-primary-hover transition-all flex items-center gap-2 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
          List Property
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all" 
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all">
          <Filter size={18} className="text-gray-400" /> Filter
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white">Sync Failed</h4>
            <p className="text-sm text-gray-500 max-w-xs">{error}</p>
          </div>
          <button 
            onClick={fetchPortfolio}
            className="text-primary text-sm font-bold hover:underline mt-2"
          >
            Try Refreshing Portfolio
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProperties.length === 0 && (
        <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-[2rem] lg:rounded-[3rem] p-8 sm:p-12 lg:p-20 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(193,155,118,0.1)]">
            <Building2 size={32} className="text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-white font-heading">No assets listed yet</h3>
          <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto font-light leading-relaxed">
            Your real estate portfolio is currently empty. Start listing your properties to begin your management journey.
          </p>
          <Link 
            href="/owner/properties/new" 
            className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 sm:px-10 py-4 rounded-2xl text-sm font-bold transition-all group"
          >
            Create Your First Listing 
            <Plus size={16} className="text-primary group-hover:scale-125 transition-transform" />
          </Link>
        </div>
      )}

      {/* Portfolio List */}
      <div className="grid grid-cols-1 gap-8">
        {filteredProperties.map((prop) => (
          <div key={prop.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-7 lg:p-10 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <Link href={`/owner/properties/${prop.id}`} className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 group/info min-w-0">
                <div className="w-full sm:w-24 h-44 sm:h-24 rounded-3xl overflow-hidden bg-primary/10 border border-white/10 relative shadow-2xl shrink-0">
                  {prop.images && prop.images[0] ? (
                    <img src={prop.images[0].image_url} alt={prop.title} className="w-full h-full object-cover group-hover/info:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40">
                      <Building2 size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/info:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight group-hover/info:text-primary transition-colors break-words">{prop.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 font-light">
                    <MapPin size={14} className="text-primary/60" /> {prop.city}, {prop.address}
                  </p>
                </div>
              </Link>

              <div className="flex flex-wrap gap-6 sm:gap-8 lg:gap-12 lg:border-l lg:border-white/5 lg:pl-12">
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Valuation</p>
                  <p className="text-lg font-bold text-white leading-none">NGN {prop.price.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Mandate</p>
                  <p className="text-sm font-bold text-gray-400 capitalize bg-white/5 px-3 py-1 rounded-lg inline-block">{prop.mandate_type.toLowerCase()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Management</p>
                  {prop.agent_id ? (
                    <p className="text-sm font-bold text-green-400 flex items-center gap-2">
                      <ShieldCheck size={16} /> Secured Agent
                    </p>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProperty({ id: prop.id, title: prop.title });
                        setIsModalOpen(true);
                      }}
                      className="text-xs font-bold text-primary hover:text-white transition-all flex items-center gap-1.5 underline underline-offset-4"
                    >
                      <Plus size={14} /> Assign Manager
                    </button>
                  )}
                </div>
              </div>

              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-5 sm:gap-8">
                <span className={cn(
                  "text-[10px] font-black px-5 py-2 rounded-xl uppercase tracking-widest border",
                  prop.status === "RENTED" 
                    ? "bg-green-500/5 text-green-400 border-green-500/10" 
                    : "bg-primary/5 text-primary border-primary/10 shadow-[0_0_20px_rgba(193,155,118,0.1)]"
                )}>
                  {prop.status}
                </span>
                <button className="p-3 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white">
                  <MoreVertical size={24} />
                </button>
              </div>
            </div>
            {prop.listing_type === "SALE" && getSaleActions(prop.status).length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-gray-500 max-w-xl">
                  Sale workflow: reservation deposit holds the property, review checks documentation and settlement, then owner or agent confirms sold.
                </p>
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
        ))}
      </div>

      {selectedProperty && (
        <AssignAgentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.title}
          onSuccess={fetchPortfolio}
        />
      )}
    </div>
  );
}
