"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";

interface AdminProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  listing_type: "RENT" | "SALE" | string;
  status: string;
  is_verified: boolean;
  images?: { image_url: string }[];
  owner?: { email: string; profile?: { full_name?: string } };
  agent?: { email: string; profile?: { full_name?: string } };
}

interface PaginatedProperties {
  items: AdminProperty[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

const statuses = ["ALL", "AVAILABLE", "RENTED", "RESERVED", "UNDER_REVIEW", "SOLD", "MAINTENANCE", "CANCELLED"];
const listingTypes = ["ALL", "RENT", "SALE"];
const PAGE_SIZE = 8;
const moderationActions = [
  { status: "AVAILABLE", label: "Mark Available", helper: "Restore listing visibility" },
  { status: "MAINTENANCE", label: "Mark Maintenance", helper: "Temporarily pause activity" },
  { status: "CANCELLED", label: "Cancel Listing", helper: "Disable this listing" },
];

const formatCurrency = (amount: number) => `NGN ${Number(amount || 0).toLocaleString()}`;
const formatLabel = (value: string) => value.replaceAll("_", " ");

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingID, setUpdatingID] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [listingType, setListingType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PaginatedProperties>(ENDPOINTS.ADMIN.PROPERTIES, {
        search,
        status,
        listing_type: listingType,
        page,
        page_size: PAGE_SIZE,
      });
      setProperties(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Failed to load admin properties", err);
      toast.error("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  }, [search, status, listingType, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      queueMicrotask(() => {
        fetchProperties();
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchProperties]);

  const summary = useMemo(() => {
    return properties.reduce(
      (acc, property) => {
        acc.total += 1;
        if (property.is_verified) acc.verified += 1;
        if (property.status === "AVAILABLE") acc.available += 1;
        if (["RESERVED", "UNDER_REVIEW"].includes(property.status)) acc.review += 1;
        return acc;
      },
      { total: 0, verified: 0, available: 0, review: 0 }
    );
  }, [properties]);

  const updateProperty = async (id: string, payload: { status?: string; is_verified?: boolean }) => {
    setUpdatingID(id);
    try {
      await api.patch(ENDPOINTS.ADMIN.PROPERTY_MODERATION(id), payload);
      toast.success("Property moderation updated.");
      await fetchProperties();
    } catch (err) {
      console.error("Failed to update property moderation", err);
      toast.error("Failed to update property.");
    } finally {
      setUpdatingID(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Property Moderation</h1>
          <p className="text-gray-500 font-light">Review listings, verify trusted properties, and control suspicious listing visibility.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              type="text"
              placeholder="Search title, location, owner..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <select value={listingType} onChange={(event) => {
            setListingType(event.target.value);
            setPage(1);
          }} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {listingTypes.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
          </select>
          <select value={status} onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50">
            {statuses.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Loaded", value: summary.total, icon: Building2, color: "text-primary" },
          { label: "Verified", value: summary.verified, icon: ShieldCheck, color: "text-green-500" },
          { label: "Available", value: summary.available, icon: CheckCircle2, color: "text-blue-500" },
          { label: "Needs Review", value: summary.review, icon: AlertCircle, color: "text-orange-500" },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.03] border border-white/5 p-5 rounded-[2rem]">
            <div className={cn("w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center mb-4", item.color)}>
              <item.icon size={18} />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.label}</p>
            <p className="text-2xl font-bold font-heading text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Showing {properties.length} of {total} properties
          </p>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {properties.map((property) => {
            const image = property.images?.[0]?.image_url;
            const ownerName = property.owner?.profile?.full_name || property.owner?.email || "Owner pending";
            const agentName = property.agent?.profile?.full_name || property.agent?.email || "No accepted agent";
            return (
              <div key={property.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_360px] group hover:bg-white/[0.04] transition-all">
                <div className="relative w-full min-h-64 lg:min-h-full bg-white/[0.03]">
                  {image ? (
                    <Image src={image} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full min-h-56 flex items-center justify-center text-white/10">
                      <Building2 size={56} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md border",
                      property.status === "AVAILABLE" ? "bg-green-500/20 text-green-500 border-green-500/20" :
                        property.status === "CANCELLED" ? "bg-red-500/20 text-red-500 border-red-500/20" :
                          "bg-primary/20 text-primary border-primary/20"
                    )}>
                      {formatLabel(property.status)}
                    </span>
                    {property.is_verified && (
                      <span className="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/20 backdrop-blur-md">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8 min-w-0 space-y-7">
                  <div>
                    <h3 className="text-2xl font-bold font-heading mb-2 break-words">{property.title}</h3>
                    <p className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed">
                      <MapPin size={12} className="text-primary mt-0.5 shrink-0" />
                      <span>{property.address}, {property.city}, {property.state}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Owner</p>
                      <p className="text-sm font-medium text-gray-300 flex items-center gap-2 min-w-0">
                        <UserIcon size={14} className="text-primary/60 shrink-0" />
                        <span className="truncate">{ownerName}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Managed By</p>
                      <p className="text-sm font-medium text-gray-300 flex items-center gap-2 min-w-0">
                        <ShieldCheck size={14} className="text-primary/60 shrink-0" />
                        <span className="truncate">{agentName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{property.listing_type}</p>
                      <p className="text-2xl font-bold font-heading text-primary mt-2">{formatCurrency(property.price)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Current Status</p>
                      <p className="text-sm font-black uppercase tracking-widest text-white mt-3">{formatLabel(property.status)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Verification</p>
                      <p className={cn("text-sm font-black uppercase tracking-widest mt-3", property.is_verified ? "text-green-500" : "text-orange-500")}>
                        {property.is_verified ? "Verified" : "Not Verified"}
                      </p>
                    </div>
                  </div>

                  <Link href={`/properties/${property.id}`} className="inline-flex text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                    View public listing
                  </Link>
                </div>

                <aside className="border-t 2xl:border-t-0 2xl:border-l border-white/5 p-6 md:p-8 bg-black/10 space-y-5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Admin Moderation</p>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      Verify trusted listings or change availability when a listing needs platform intervention.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Verification</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {property.is_verified ? "This listing currently carries platform verification." : "Mark this listing as checked by admin."}
                      </p>
                    </div>
                    <button
                      disabled={updatingID === property.id}
                      onClick={() => updateProperty(property.id, { is_verified: !property.is_verified })}
                      className={cn(
                        "w-full min-h-11 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60",
                        property.is_verified
                          ? "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                          : "bg-white text-black hover:bg-primary"
                      )}
                    >
                      {property.is_verified ? "Remove Verification" : "Verify Listing"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Status Actions</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">Use these only when admin needs to moderate listing availability.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 2xl:grid-cols-1 gap-2">
                      {moderationActions.map((item) => (
                        <button
                          key={item.status}
                          disabled={updatingID === property.id || property.status === item.status}
                          onClick={() => updateProperty(property.id, { status: item.status })}
                          className={cn(
                            "text-left bg-white/5 border border-white/10 px-4 py-3 rounded-xl hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all",
                            item.status === "CANCELLED" && "hover:border-red-500/30 hover:bg-red-500/10"
                          )}
                        >
                          <span className="block text-[10px] font-black uppercase tracking-widest text-white">{item.label}</span>
                          <span className="block text-[10px] text-gray-500 mt-1 leading-relaxed">{property.status === item.status ? "Current state" : item.helper}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            );
          })}

          {properties.length === 0 && (
            <div className="xl:col-span-2 py-24 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
              <p className="text-gray-500 font-light italic">No properties match your filters.</p>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
