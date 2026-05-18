"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Loader2,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { api } from "@/lib/api/methods";
import { cn } from "@/lib/utils";

interface OwnedProperty {
  id: string;
  source: string;
  started_at: string;
  notes?: string;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    price: number;
    status: string;
    listing_type: string;
    images?: { image_url: string }[];
  };
  sale_reservation?: {
    id: string;
    amount: number;
    payment_reference: string;
    final_settlement_amount: number;
    final_settlement_reference: string;
    final_settlement_date?: string | null;
    status: string;
  };
}

const formatCurrency = (amount?: number) => `NGN ${(amount || 0).toLocaleString()}`;

export default function TenantOwnedPropertiesPage() {
  const [ownerships, setOwnerships] = useState<OwnedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnedProperties = async () => {
      try {
        const data = await api.get<OwnedProperty[]>(ENDPOINTS.PROPERTIES.OWNED);
        setOwnerships(data || []);
      } catch {
        toast.error("Failed to load owned properties.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <Link href="/tenant" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Owned Properties</h1>
            <p className="text-gray-500 font-light mt-2">
              Properties transferred to you after sale settlement appear here without changing your tenant login.
            </p>
          </div>
        </div>
        <Link href="/properties" className="inline-flex items-center gap-2 bg-primary text-black px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all">
          Explore Listings
        </Link>
      </div>

      {ownerships.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-5 text-gray-700">
            <Building2 size={30} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No transferred properties yet</h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            When you complete a property purchase, the ownership record and transfer evidence will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {ownerships.map((ownership) => {
            const property = ownership.property;
            const reservation = ownership.sale_reservation;
            const image = property?.images?.[0]?.image_url;

            return (
              <article key={ownership.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
                <div className="relative h-64 bg-white/5">
                  {image ? (
                    <Image src={image} alt={property?.title || "Owned property"} fill className="object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-700">
                      <Building2 size={60} className="opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                    <span className="bg-green-500/90 text-black px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Current Owner
                    </span>
                    <span className="bg-black/50 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {property?.status || "SOLD"}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-white">{property?.title || "Transferred Property"}</h2>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={15} className="text-primary" />
                      <span>{property ? `${property.address}, ${property.city}, ${property.state}` : "Location unavailable"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: CalendarDays, label: "Owned Since", value: new Date(ownership.started_at).toLocaleDateString() },
                      { icon: ReceiptText, label: "Settlement", value: formatCurrency(reservation?.final_settlement_amount) },
                      { icon: ShieldCheck, label: "Source", value: ownership.source.replaceAll("_", " ") },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-white/5 border border-white/5 p-4">
                        <div className="flex items-center gap-2 text-primary mb-2">
                          <item.icon size={14} />
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{item.label}</p>
                        </div>
                        <p className="text-xs font-bold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <BadgeCheck size={16} />
                      <p className="text-xs font-black uppercase tracking-widest">Transfer Proof</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px]">Reservation Ref</p>
                        <p className="mt-1 text-gray-300 break-all">{reservation?.payment_reference || "Not available"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px]">Settlement Ref</p>
                        <p className="mt-1 text-gray-300 break-all">{reservation?.final_settlement_reference || "Not available"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {property?.id && (
                      <Link href={`/properties/${property.id}`} className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all">
                        View Property
                      </Link>
                    )}
                    <Link href="/tenant/payments" className={cn(
                      "flex-1 inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    )}>
                      <FileText size={14} /> Payment Records
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
