"use client";

import { useState } from "react";
import { 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  FileText, 
  ArrowLeft,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  owner_id?: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  price: number;
  agency_fee: number;
  legal_fee: number;
  caution_deposit: number;
  total_package: number;
  mandate_type: string;
  mandate_document_url?: string;
  status: string;
  images: { image_url: string }[];
  owner?: { id: string; profile: { full_name: string }; email: string };
  agent?: { id: string; profile: { full_name: string }; email: string };
  created_at: string;
}

interface PropertyDetailsViewProps {
  property: Property;
  backUrl: string;
}

export function PropertyDetailsView({ property, backUrl }: PropertyDetailsViewProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const { user } = useAuthStore();
  const isOwner = user?.role === "OWNER" && property.owner_id === user.id;

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation & Actions */}
      <div className="flex justify-between items-center">
        <Link href={backUrl} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="font-bold text-sm">Back to Portfolio</span>
        </Link>
        <div className="flex gap-3">
          <button className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5">
            <Share2 size={18} />
          </button>
          {isOwner && (
            <button className="bg-primary text-black px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary-hover transition-all flex items-center gap-2">
              Edit Asset <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left Column: Gallery & Description */}
        <div className="xl:col-span-2 space-y-10">
          {/* Main Gallery */}
          <div className="relative group rounded-[3rem] overflow-hidden bg-white/[0.02] border border-white/5 aspect-[16/9]">
            {property.images && property.images.length > 0 ? (
              <>
                <img 
                  src={property.images[activeImage].image_url} 
                  alt={property.title} 
                  className="w-full h-full object-cover transition-all duration-1000"
                />
                
                {property.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Counter & Status */}
                <div className="absolute top-8 left-8 flex gap-3">
                  <span className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                    {activeImage + 1} / {property.images.length} Photos
                  </span>
                  <span className={cn(
                    "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest backdrop-blur-xl",
                    property.status === "AVAILABLE" ? "bg-green-500/20 text-green-400 border-green-500/20" : "bg-primary/20 text-primary border-primary/20"
                  )}>
                    {property.status}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700 flex-col gap-4">
                <Building2 size={64} className="opacity-20" />
                <p className="font-bold text-sm">No images available for this asset</p>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {property.images && property.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {property.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all",
                    activeImage === idx ? "border-primary scale-95" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Asset Info Header */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-white tracking-tight leading-tight">
                  {property.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-500">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <MapPin size={16} className="text-primary/60" /> {property.address}, {property.city}
                  </p>
                  <div className="w-1 h-1 rounded-full bg-gray-700" />
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Tag size={16} className="text-primary/60" /> {property.mandate_type}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Info size={20} />
                <h3 className="text-lg font-bold">Asset Description</h3>
              </div>
              <p className="text-gray-400 leading-relaxed font-light text-lg whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Financials & Management */}
        <div className="space-y-8">
          {/* Pricing Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-primary/10" />
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Package</p>
              <h2 className="text-5xl font-bold text-white tracking-tighter">
                ₦{property.total_package.toLocaleString()}
              </h2>
              <p className="text-xs text-primary font-bold">All fees included</p>
            </div>

            <div className="space-y-6 border-t border-white/5 pt-10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-light">Annual Rent</span>
                <span className="text-sm font-bold text-white">₦{property.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-light">Agency Fee (10%)</span>
                <span className="text-sm font-bold text-white">₦{property.agency_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-light">Legal Fee (10%)</span>
                <span className="text-sm font-bold text-white">₦{property.legal_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-light">Caution Deposit</span>
                <span className="text-sm font-bold text-white">₦{property.caution_deposit.toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group/btn">
              Download Invoice <FileText size={18} className="text-primary group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>

          {/* Management Details */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8">
            <h3 className="text-lg font-bold text-white">Stakeholders</h3>
            
            {/* Owner (Visible to Agents) */}
            {property.owner?.profile && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Property Owner</p>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group/owner">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {property.owner.profile.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{property.owner.profile.full_name}</p>
                      <p className="text-xs text-gray-500">{property.owner.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/messages?userId=${property.owner?.id}`)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover/owner:opacity-100"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Agent (Visible to Owners) */}
            {property.agent?.profile && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Assigned Manager</p>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group/agent">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {property.agent.profile.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{property.agent.profile.full_name}</p>
                      <p className="text-xs text-gray-500">{property.agent.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/messages?userId=${property.agent?.id}`)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover/agent:opacity-100"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            )}

            {!property.agent && !property.owner && (
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center space-y-3">
                <ShieldCheck size={32} className="text-primary/40 mx-auto" />
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Management status is currently private or unassigned.
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-3 text-gray-500 text-sm">
                 <Calendar size={16} />
                 <span>Listed on {new Date(property.created_at).toLocaleDateString()}</span>
               </div>
               {property.mandate_document_url && (
                 <a 
                   href={property.mandate_document_url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-3 text-primary text-sm font-bold hover:underline"
                 >
                   <FileText size={16} /> View Mandate Agreement
                 </a>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
