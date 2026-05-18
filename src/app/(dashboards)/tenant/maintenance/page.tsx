"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Droplets,
  Filter,
  Hammer,
  Home,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Wrench,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import { ReportIssueModal } from "@/components/maintenance/report-issue-modal";
import { toast } from "sonner";

interface MaintenanceUpdate {
  id: string;
  status: string;
  note?: string;
  created_at: string;
  actor?: { email?: string; profile?: { full_name?: string } };
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  status_note?: string;
  image_url?: string;
  created_at: string;
  updates?: MaintenanceUpdate[];
}

interface DashboardData {
  lease: { property_id: string };
  maintenance: MaintenanceRequest[];
}

const CATEGORY_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PLUMBING: { icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
  ELECTRICAL: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  GENERAL: { icon: Hammer, color: "text-primary", bg: "bg-primary/10" },
};

const CLOSED_STATUSES = ["RESOLVED", "CLOSED"];

const getErrorMessage = (err: unknown, fallback: string) => {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof err.response === "object" &&
    err.response !== null &&
    "data" in err.response &&
    typeof err.response.data === "object" &&
    err.response.data !== null &&
    "message" in err.response.data &&
    typeof err.response.data.message === "string"
  ) {
    return err.response.data.message;
  }

  return fallback;
};

export default function TenantMaintenancePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get<DashboardData>(ENDPOINTS.TENANT.DASHBOARD);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch maintenance requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchRequests();
    });
  }, []);

  const updateTenantStatus = async (id: string, nextStatus: "CLOSED" | "REOPENED") => {
    const endpoint = nextStatus === "CLOSED" ? ENDPOINTS.MAINTENANCE.CLOSE(id) : ENDPOINTS.MAINTENANCE.REOPEN(id);
    try {
      await api.post<null>(endpoint, {});
      setData((current) => {
        if (!current) return current;
        return {
          ...current,
          maintenance: current.maintenance.map((request) =>
            request.id === id
              ? {
                  ...request,
                  status: nextStatus,
                  updates: [
                    ...(request.updates || []),
                    {
                      id: `${id}-${Date.now()}`,
                      status: nextStatus,
                      note: nextStatus === "CLOSED" ? "Tenant confirmed the issue is fixed." : "Tenant reopened the request.",
                      created_at: new Date().toISOString(),
                    },
                  ],
                }
              : request
          ),
        };
      });
      toast.success(nextStatus === "CLOSED" ? "Request closed as fixed." : "Request reopened.");
    } catch (err) {
      console.error("Failed to update maintenance request", err);
      toast.error(getErrorMessage(err, "Failed to update maintenance request."));
    }
  };

  const filtered = data?.maintenance.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center space-y-8">
        <Home size={48} className="mx-auto text-gray-700" />
        <p className="text-gray-500">No active lease found. You can report issues once your lease is active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Maintenance Requests</h1>
          <p className="text-gray-500 font-light text-lg">Report issues in your home and track repairs in real-time.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto justify-center bg-primary text-black px-6 sm:px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Report New Issue
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search my tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] py-5 pl-16 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all text-gray-400">
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((ticket) => {
          const cat = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.GENERAL;
          return (
            <div key={ticket.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] lg:rounded-[3rem] p-5 sm:p-8 md:p-10 hover:bg-white/[0.04] transition-all group">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 min-w-0">
                  <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0", cat.bg, cat.color)}>
                    <cat.icon size={28} />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-primary transition-colors break-words">{ticket.title}</h3>
                    <p className="text-sm text-gray-500 font-light flex items-center gap-2">
                      <Clock size={14} /> Submitted {new Date(ticket.created_at).toLocaleDateString()} - {ticket.category}
                    </p>
                    {ticket.status_note && (
                      <p className="text-xs text-primary/80 font-medium max-w-md leading-relaxed">Latest update: {ticket.status_note}</p>
                    )}
                    <div className="flex flex-wrap gap-3 pt-1">
                      {ticket.image_url && (
                        <a href={ticket.image_url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover">
                          View evidence
                        </a>
                      )}
                      {ticket.updates && ticket.updates.length > 0 && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                          {ticket.updates.length} update{ticket.updates.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 sm:gap-12 lg:border-l lg:border-white/5 lg:pl-12">
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black">Priority</p>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", ticket.priority === "HIGH" || ticket.priority === "URGENT" ? "bg-red-500 animate-pulse" : "bg-primary")} />
                      <span className="text-sm font-bold text-white uppercase tracking-tighter">{ticket.priority}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black">Status</p>
                    <div className="flex items-center gap-2">
                      {CLOSED_STATUSES.includes(ticket.status) ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-primary" />}
                      <span className={cn("text-sm font-bold uppercase tracking-tighter", CLOSED_STATUSES.includes(ticket.status) ? "text-green-500" : "text-primary")}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {ticket.status === "RESOLVED" && (
                    <button
                      onClick={() => updateTenantStatus(ticket.id, "CLOSED")}
                      className="px-5 sm:px-8 py-4 rounded-2xl bg-green-500/10 border border-green-500/10 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all text-green-500"
                    >
                      Confirm Fixed
                    </button>
                  )}
                  {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
                    <button
                      onClick={() => updateTenantStatus(ticket.id, "REOPENED")}
                      className="px-5 sm:px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-gray-400"
                    >
                      Reopen
                    </button>
                  )}
                  <button className="p-4 hover:bg-white/5 rounded-2xl transition-colors text-gray-700">
                    <MoreVertical size={24} />
                  </button>
                </div>
              </div>

              {ticket.updates && ticket.updates.length > 0 && (
                <div className="mt-8 border-t border-white/5 pt-6 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Request Timeline</p>
                  <div className="grid gap-2">
                    {ticket.updates.map((update) => (
                      <div key={update.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 rounded-2xl bg-white/[0.02] px-4 py-3">
                        <p className="text-xs text-gray-400">
                          <span className="font-bold text-white">{update.status.replace("_", " ")}</span>
                          {update.note ? ` - ${update.note}` : ""}
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 sm:py-24 lg:py-32 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem] lg:rounded-[4rem]">
            <Wrench className="w-16 h-16 text-white/5 mx-auto mb-6" />
            <p className="text-gray-500 font-light">No maintenance requests found.</p>
          </div>
        )}
      </div>

      <ReportIssueModal
        propertyId={data.lease.property_id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
