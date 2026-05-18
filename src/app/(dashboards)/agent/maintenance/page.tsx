"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Search,
  Hammer,
  Zap,
  Droplets,
  Shield,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StatusNoteModal } from "@/components/maintenance/status-note-modal";
import { CustomSelect } from "@/components/ui/custom-select";

interface MaintenanceRequest {
  id: string;
  property_id: string;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
  status_note?: string;
  image_url?: string;
  created_at: string;
  updates?: {
    id: string;
    status: MaintenanceRequest["status"];
    note?: string;
    created_at: string;
    actor?: { email?: string; profile?: { full_name?: string } };
  }[];
}

const PRIORITY_CONFIG = {
  URGENT: { label: "Urgent", color: "text-red-400", bg: "bg-red-500/10 border-red-500/10", dot: "bg-red-400" },
  HIGH:   { label: "High",   color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/10", dot: "bg-orange-400" },
  MEDIUM: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/10", dot: "bg-yellow-400" },
  LOW:    { label: "Low",    color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/10", dot: "bg-blue-400" },
};

const STATUS_CONFIG = {
  PENDING:     { label: "Pending",     color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/10" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/10" },
  IN_PROGRESS: { label: "In Progress", color: "text-primary",    bg: "bg-primary/10 border-primary/10" },
  RESOLVED:    { label: "Resolved",    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/10" },
  CLOSED:       { label: "Closed",      color: "text-green-500",  bg: "bg-green-500/10 border-green-500/10" },
  REOPENED:     { label: "Reopened",    color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/10" },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ELECTRICAL: <Zap size={18} />,
  PLUMBING:   <Droplets size={18} />,
  SECURITY:   <Shield size={18} />,
  GENERAL:    <Hammer size={18} />,
  OTHER:      <HelpCircle size={18} />,
};

const STATUS_OPTIONS = [
  { id: "ALL", label: "All Tasks" },
  { id: "PENDING", label: "Pending" },
  { id: "ACKNOWLEDGED", label: "Acknowledged" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "CLOSED", label: "Closed" },
  { id: "REOPENED", label: "Reopened" },
];

const UPDATE_STATUS_OPTIONS = [
  { id: "PENDING", label: "Pending" },
  { id: "ACKNOWLEDGED", label: "Acknowledged" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "RESOLVED", label: "Resolved" },
];

export default function AgentMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; status: MaintenanceRequest["status"] } | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.get<MaintenanceRequest[]>(ENDPOINTS.MAINTENANCE.AGENT);
        setRequests(data || []);
      } catch {
        toast.error("Failed to load your work orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: MaintenanceRequest["status"], note: string) => {
    setUpdating(true);
    try {
      await api.patch(ENDPOINTS.MAINTENANCE.UPDATE_STATUS(id), { status, note });
      setRequests(prev => prev.map(r => r.id === id ? {
        ...r,
        status,
        status_note: note,
        updates: [
          ...(r.updates || []),
          { id: `${id}-${Date.now()}`, status, note, created_at: new Date().toISOString() },
        ],
      } : r));
      toast.success(`Updated to ${STATUS_CONFIG[status].label}`);
      setPendingUpdate(null);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = requests.filter(r => {
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return <div className="space-y-10 animate-pulse"><div className="h-20 w-1/3 bg-white/5 rounded-2xl" /><div className="h-96 bg-white/5 rounded-[3rem]" /></div>;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Maintenance Oversight</h1>
        <p className="text-gray-500 font-light">Manage repair requests for your assigned properties.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <CustomSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={STATUS_OPTIONS}
          icon={<Wrench size={15} />}
          className="w-full md:w-56"
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map(req => {
          const priority = PRIORITY_CONFIG[req.priority];
          const status = STATUS_CONFIG[req.status];
          const catIcon = CATEGORY_ICONS[req.category] ?? CATEGORY_ICONS.OTHER;

          return (
            <div key={req.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all group">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-all shrink-0">
                    {catIcon}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold text-white tracking-tight">{req.title}</h4>
                    <p className="text-sm text-gray-500 font-light max-w-md leading-relaxed">{req.description}</p>
                    {req.status_note && (
                      <p className="text-xs text-primary/80 font-medium max-w-md leading-relaxed">Latest note: {req.status_note}</p>
                    )}
                    <div className="flex gap-4 mt-2">
                      <span className={cn("text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest", priority.bg, priority.color)}>
                        {priority.label}
                      </span>
                      {req.image_url && (
                        <a href={req.image_url} target="_blank" rel="noreferrer" className="text-[10px] font-black px-3 py-1 rounded-lg bg-primary/10 text-primary uppercase tracking-widest">
                          Evidence
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {req.status === "CLOSED" ? (
                    <span className={cn("text-[10px] font-black px-4 py-2 rounded-xl border uppercase tracking-widest", status.bg, status.color)}>
                      {status.label}
                    </span>
                  ) : (
                    <CustomSelect
                      value={req.status}
                      onChange={(value) => setPendingUpdate({ id: req.id, status: value as MaintenanceRequest["status"] })}
                      options={req.status === "REOPENED" ? [...UPDATE_STATUS_OPTIONS, { id: "REOPENED", label: "Reopened" }] : UPDATE_STATUS_OPTIONS}
                      icon={null}
                      size="compact"
                      className="w-44"
                    />
                  )}
                </div>
              </div>
              {req.updates && req.updates.length > 0 && (
                <div className="mt-6 border-t border-white/5 pt-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Work Order Timeline</p>
                  <div className="grid gap-2">
                    {req.updates.slice(-3).map((update) => (
                      <div key={update.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 rounded-2xl bg-white/[0.02] px-4 py-3">
                        <p className="text-xs text-gray-400">
                          <span className="font-bold text-white">{STATUS_CONFIG[update.status]?.label || update.status}</span>
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
          <div className="text-center p-20 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
            <Wrench className="w-12 h-12 text-white/5 mx-auto mb-4" />
            <p className="text-gray-500">No work orders found matching your search.</p>
          </div>
        )}
      </div>
      <StatusNoteModal
        isOpen={Boolean(pendingUpdate)}
        loading={updating}
        statusLabel={pendingUpdate ? STATUS_CONFIG[pendingUpdate.status].label : ""}
        requestTitle={requests.find((request) => request.id === pendingUpdate?.id)?.title}
        onClose={() => setPendingUpdate(null)}
        onSubmit={(note) => {
          if (pendingUpdate) {
            updateStatus(pendingUpdate.id, pendingUpdate.status, note);
          }
        }}
      />
    </div>
  );
}
