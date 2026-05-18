"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  Bell
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const activeListings = [
  {
    id: "1",
    title: "Villa Marittima",
    location: "Victoria Island, Lagos",
    rent: 12000000,
    type: "Exclusive",
    status: "Available",
    owner: "Alice Smith",
  },
  {
    id: "2",
    title: "The Glass House",
    location: "Ikoyi, Lagos",
    rent: 24000000,
    type: "Shared Listing",
    status: "Available",
    owner: "Mark Johnson",
  }
];

const newAssignments = [
  {
    id: "3",
    title: "Oceanfront Penthouse",
    location: "Lekki Phase 1, Lagos",
    rent: 15000000,
    type: "Exclusive",
    owner: "David Chen",
    date: "2 hours ago"
  },
  {
    id: "4",
    title: "Modernist Retreat",
    location: "Banana Island, Lagos",
    rent: 35000000,
    type: "Shared Listing",
    owner: "Sophia Lorenz",
    date: "5 hours ago"
  }
];

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "requests">("active");

  const calculatePackage = (rent: number) => {
    const agency = rent * 0.1;
    const legal = rent * 0.05;
    const caution = rent * 0.1;
    const total = rent + agency + legal + caution;
    return { agency, legal, caution, total };
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">My Listings</h1>
          <p className="text-gray-500 font-light">Manage your active properties and review new management assignments.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Link href="/agent/listings/new" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-black px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all text-sm">
            <Plus size={20} /> Add New Property
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-8">
        <button 
          onClick={() => setActiveTab("active")}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative",
            activeTab === "active" ? "text-primary" : "text-gray-500 hover:text-white"
          )}
        >
          Active Management ({activeListings.length})
          {activeTab === "active" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></div>}
        </button>
        <button 
          onClick={() => setActiveTab("requests")}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative flex items-center gap-2",
            activeTab === "requests" ? "text-primary" : "text-gray-500 hover:text-white"
          )}
        >
          New Assignments
          <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">{newAssignments.length}</span>
          {activeTab === "requests" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></div>}
        </button>
      </div>

      {activeTab === "active" ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search active listings..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all text-gray-400">
              <Filter size={18} /> Filter
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeListings.map((m) => {
              const pkg = calculatePackage(m.rent);
              return (
                <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all group">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500">
                          <Building2 size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-heading text-white">{m.title}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} /> {m.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="text-[10px] font-bold px-3 py-1 bg-white/5 border border-white/10 rounded-full uppercase tracking-widest">{m.type}</span>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">{m.status}</span>
                      </div>
                    </div>

                    <div className="lg:col-span-6 bg-black/40 border border-white/5 rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Move-in Package</span>
                        <span className="text-lg font-bold font-heading text-primary">₦{pkg.total.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1"><p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Rent</p><p className="text-xs font-bold text-gray-300">₦{m.rent.toLocaleString()}</p></div>
                        <div className="space-y-1"><p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Agency</p><p className="text-xs font-bold text-primary">₦{pkg.agency.toLocaleString()}</p></div>
                        <div className="space-y-1"><p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Legal</p><p className="text-xs font-bold text-gray-300">₦{pkg.legal.toLocaleString()}</p></div>
                        <div className="space-y-1"><p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Caution</p><p className="text-xs font-bold text-gray-300">₦{pkg.caution.toLocaleString()}</p></div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-3">
                      <button className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 rounded-xl transition-all">Edit</button>
                      <button className="w-full text-primary hover:text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
                        Apps <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {newAssignments.map((req) => (
            <div key={req.id} className="bg-white/[0.02] border-2 border-dashed border-primary/20 rounded-[2.5rem] p-8 hover:bg-primary/[0.02] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                  <Bell size={12} className="animate-bounce" /> New Assignment
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500">
                      <Building2 size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading text-white">{req.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> {req.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                    <span className="bg-white/5 px-3 py-1 rounded-full">Owner: {req.owner}</span>
                    <span className="bg-white/5 px-3 py-1 rounded-full">{req.type}</span>
                    <span className="text-primary/60">{req.date}</span>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-3xl p-6 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Target Annual Rent</p>
                  <p className="text-2xl font-bold font-heading text-primary">₦{req.rent.toLocaleString()}</p>
                </div>

                <div className="lg:col-span-3 flex gap-4">
                  <button className="flex-1 bg-primary text-black px-6 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Accept
                  </button>
                  <button className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
