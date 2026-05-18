"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
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
  { id: "ALL", label: "All Statuses" },
  { id: "PENDING", label: "Pending" },
  { id: "ACKNOWLEDGED", label: "Acknowledged" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "CLOSED", label: "Closed" },
  { id: "REOPENED", label: "Reopened" },
];

const PRIORITY_OPTIONS = [
  { id: "ALL", label: "All Priorities" },
  { id: "URGENT", label: "Urgent" },
  { id: "HIGH", label: "High" },
  { id: "MEDIUM", label: "Medium" },
  { id: "LOW", label: "Low" },
];

const UPDATE_STATUS_OPTIONS = [
  { id: "PENDING", label: "Mark Pending" },
  { id: "ACKNOWLEDGED", label: "Acknowledge" },
  { id: "IN_PROGRESS", label: "Mark In Progress" },
  { id: "RESOLVED", label: "Mark Resolved" },
];

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; status: MaintenanceRequest["status"] } | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.get<MaintenanceRequest[]>(ENDPOINTS.MAINTENANCE.OWNER);
        setRequests(data || []);
      } catch {
        toast.error("Failed to load maintenance requests.");
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
      setRequests(prev =>
        prev.map(r => r.id === id ? {
          ...r,
          status,
          status_note: note,
          updates: [
            ...(r.updates || []),
            { id: `${id}-${Date.now()}`, status, note, created_at: new Date().toISOString() },
          ],
        } : r)
      );
      toast.success(`Request marked as ${STATUS_CONFIG[status].label}`);
      setPendingUpdate(null);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = requests.filter(r => {
    const matchStatus   = filterStatus === "ALL"   || r.status === filterStatus;
    const matchPriority = filterPriority === "ALL" || r.priority === filterPriority;
    const matchSearch   = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const counts = {
    pending:    requests.filter(r => r.status === "PENDING").length,
    inProgress: requests.filter(r => r.status === "IN_PROGRESS").length,
    resolved:   requests.filter(r => r.status === "RESOLVED" || r.status === "CLOSED").length,
    urgent:     requests.filter(r => r.priority === "URGENT").length,
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 w-1/3 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 rounded-[2rem]" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">Maintenance</h1>
          <p className="text-gray-500 font-light">Track and resolve all property repair requests in one place.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Pending",     value: counts.pending,    icon: <Clock size={22} />,         color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "In Progress", value: counts.inProgress, icon: <Wrench size={22} />,        color: "text-primary",    bg: "bg-primary/10" },
          { label: "Resolved",    value: counts.resolved,   icon: <CheckCircle2 size={22} />,  color: "text-green-400",  bg: "bg-green-500/10" },
          { label: "Urgent",      value: counts.urgent,     icon: <AlertTriangle size={22} />, color: "text-red-400",    bg: "bg-red-500/10" },
        ].map(stat => (
          <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-7 space-y-4">
            <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title or description..."
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
        <CustomSelect
          value={filterPriority}
          onChange={setFilterPriority}
          options={PRIORITY_OPTIONS}
          icon={<AlertTriangle size={15} />}
          className="w-full md:w-56"
        />
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-dashed border-white/5 rounded-[2rem] lg:rounded-[3rem] p-8 sm:p-12 lg:p-20 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Wrench size={32} className="text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold mb-3 font-heading text-white">No requests found</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto font-light leading-relaxed">
            {requests.length === 0
              ? "Your properties have no maintenance requests yet. All is well!"
              : "No requests match your current filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => {
            const priority = PRIORITY_CONFIG[req.priority];
            const status   = STATUS_CONFIG[req.status];
            const catIcon  = CATEGORY_ICONS[req.category] ?? CATEGORY_ICONS.OTHER;

            return (
              <div key={req.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-8 hover:bg-white/[0.04] transition-all group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

                  {/* Left: Icon + Details */}
                  <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                      {catIcon}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="text-lg font-bold text-white tracking-tight break-words">{req.title}</h4>
                      <p className="text-sm text-gray-500 font-light max-w-md leading-relaxed line-clamp-2">{req.description}</p>
                      {req.status_note && (
                        <p className="text-xs text-primary/80 font-medium max-w-md leading-relaxed">Latest note: {req.status_note}</p>
                      )}
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                        {new Date(req.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <div className="flex flex-wrap gap-3 pt-2">
                        {req.image_url && (
                          <a href={req.image_url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover">
                            View evidence
                          </a>
                        )}
                        {req.updates && req.updates.length > 0 && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                            {req.updates.length} update{req.updates.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges + Actions */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
                    {/* Priority Badge */}
                    <span className={cn("text-[10px] font-black px-4 py-2 rounded-xl border uppercase tracking-widest flex items-center gap-2", priority.bg, priority.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />
                      {priority.label}
                    </span>

                    {/* Status Badge */}
                    <span className={cn("text-[10px] font-black px-4 py-2 rounded-xl border uppercase tracking-widest", status.bg, status.color)}>
                      {status.label}
                    </span>

                    {/* Status Updater */}
                    {req.status !== "CLOSED" && (
                      <CustomSelect
                        value={req.status}
                        onChange={(value) => setPendingUpdate({ id: req.id, status: value as MaintenanceRequest["status"] })}
                        options={req.status === "REOPENED" ? [...UPDATE_STATUS_OPTIONS, { id: "REOPENED", label: "Reopened" }] : UPDATE_STATUS_OPTIONS}
                        icon={null}
                        size="compact"
                        className="w-full sm:w-44"
                      />
                    )}
                  </div>
                </div>
                {req.updates && req.updates.length > 0 && (
                  <div className="mt-6 border-t border-white/5 pt-5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Repair Timeline</p>
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
        </div>
      )}
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
