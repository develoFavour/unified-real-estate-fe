"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, CheckCircle2, FileText, LifeBuoy, Loader2, Send, ShieldAlert, Upload } from "lucide-react";
import { toast } from "sonner";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { api } from "@/lib/api/methods";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

type RoleMode = "tenant" | "owner" | "agent";

interface SupportCasesPageProps {
  mode: RoleMode;
}

interface UserRef {
  id?: string;
  email?: string;
  profile?: { full_name?: string };
}

interface CaseRecord {
  id: string;
  case_type?: "SUPPORT" | "DISPUTE";
  category?: string;
  title?: string;
  reason: string;
  description: string;
  priority?: string;
  status: string;
  evidence_url?: string;
  response?: string;
  resolution?: string;
  created_at: string;
  property?: { id: string; title: string; location?: string; address?: string };
  respondent?: UserRef;
  reported_user?: UserRef;
}

interface PropertyOption {
  id: string;
  label: string;
  reportedUserId?: string;
}

const MODE_COPY: Record<RoleMode, { title: string; intro: string }> = {
  tenant: {
    title: "Support And Complaints",
    intro: "Open platform support requests, dispute payments or lease issues, and report owner or agent concerns.",
  },
  owner: {
    title: "Support And Complaints",
    intro: "Escalate tenant, agent, mandate, revenue, listing, or platform issues from one place.",
  },
  agent: {
    title: "Support And Complaints",
    intro: "Raise mandate, owner, tenant, maintenance, payment, or platform support cases.",
  },
};

const CATEGORY_OPTIONS: Record<RoleMode, { id: string; label: string; type: "SUPPORT" | "DISPUTE" }[]> = {
  tenant: [
    { id: "GENERAL_SUPPORT", label: "General Support", type: "SUPPORT" },
    { id: "PAYMENT_ISSUE", label: "Payment Issue", type: "SUPPORT" },
    { id: "LEASE_RENT_ISSUE", label: "Lease/Rent Dispute", type: "DISPUTE" },
    { id: "DOCUMENT_ISSUE", label: "Document Issue", type: "DISPUTE" },
    { id: "REPORT_AGENT", label: "Report Agent", type: "DISPUTE" },
    { id: "REPORT_OWNER", label: "Report Owner", type: "DISPUTE" },
    { id: "MAINTENANCE_ESCALATION", label: "Maintenance Escalation", type: "DISPUTE" },
  ],
  owner: [
    { id: "GENERAL_SUPPORT", label: "General Support", type: "SUPPORT" },
    { id: "PROPERTY_MODERATION", label: "Listing/Moderation Issue", type: "SUPPORT" },
    { id: "PAYMENT_REVENUE_ISSUE", label: "Payment/Revenue Issue", type: "SUPPORT" },
    { id: "REPORT_AGENT", label: "Report Agent", type: "DISPUTE" },
    { id: "REPORT_TENANT", label: "Report Tenant", type: "DISPUTE" },
    { id: "MANDATE_DISPUTE", label: "Mandate Dispute", type: "DISPUTE" },
  ],
  agent: [
    { id: "GENERAL_SUPPORT", label: "General Support", type: "SUPPORT" },
    { id: "PAYMENT_ISSUE", label: "Payment Issue", type: "SUPPORT" },
    { id: "MANDATE_DISPUTE", label: "Mandate Dispute", type: "DISPUTE" },
    { id: "REPORT_OWNER", label: "Report Owner", type: "DISPUTE" },
    { id: "REPORT_TENANT", label: "Report Tenant", type: "DISPUTE" },
    { id: "MAINTENANCE_ESCALATION", label: "Maintenance Escalation", type: "DISPUTE" },
  ],
};

const PRIORITY_OPTIONS = [
  { id: "LOW", label: "Low" },
  { id: "MEDIUM", label: "Medium" },
  { id: "HIGH", label: "High" },
  { id: "URGENT", label: "Urgent" },
];

const statusStyles: Record<string, string> = {
  OPEN: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  RESPONDED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  UNDER_REVIEW: "bg-primary/10 text-primary border-primary/20",
  RESOLVED: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const nameOf = (user?: UserRef) => user?.profile?.full_name || user?.email || "Platform team";

export function SupportCasesPage({ mode }: SupportCasesPageProps) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [form, setForm] = useState({
    category: "GENERAL_SUPPORT",
    title: "",
    description: "",
    priority: "MEDIUM",
    property_id: "",
  });

  const selectedCategory = CATEGORY_OPTIONS[mode].find((item) => item.id === form.category) || CATEGORY_OPTIONS[mode][0];
  const selectedProperty = propertyOptions.find((item) => item.id === form.property_id);

  const fetchCases = useCallback(async () => {
    try {
      const data = await api.get<CaseRecord[]>(ENDPOINTS.DISPUTES.MINE);
      setCases(data || []);
    } catch (err) {
      console.error("Failed to load cases", err);
      toast.error("Failed to load support cases.");
    }
  }, []);

  const fetchContext = useCallback(async () => {
    try {
      if (mode === "tenant") {
        const [dashboard, requests] = await Promise.allSettled([
          api.get<{ property?: { id: string; title: string; location?: string } }>(ENDPOINTS.TENANT.DASHBOARD),
          api.get<{ property?: { id: string; title: string; location?: string } }[]>("/tenant/lease-requests"),
        ]);
        const options: PropertyOption[] = [];
        if (dashboard.status === "fulfilled" && dashboard.value?.property?.id) {
          options.push({ id: dashboard.value.property.id, label: dashboard.value.property.title });
        }
        if (requests.status === "fulfilled") {
          requests.value?.forEach((request) => {
            if (request.property?.id && !options.some((item) => item.id === request.property?.id)) {
              options.push({ id: request.property.id, label: request.property.title });
            }
          });
        }
        setPropertyOptions(options);
      }

      if (mode === "owner") {
        const properties = await api.get<{ id: string; title: string; agent_id?: string }[]>(ENDPOINTS.PROPERTIES.ME);
        setPropertyOptions((properties || []).map((property) => ({
          id: property.id,
          label: property.title,
          reportedUserId: property.agent_id,
        })));
      }

      if (mode === "agent") {
        const summary = await api.get<{ active_mandates?: { id: string; title: string; owner?: UserRef }[]; pending_mandates?: { id: string; title: string; owner?: UserRef }[] }>(ENDPOINTS.AGENT.SUMMARY);
        const mandates = [...(summary.active_mandates || []), ...(summary.pending_mandates || [])];
        setPropertyOptions(mandates.map((property) => ({
          id: property.id,
          label: property.title,
          reportedUserId: property.owner?.id,
        })));
      }
    } catch (err) {
      console.error("Failed to load support context", err);
    }
  }, [mode]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.allSettled([fetchCases(), fetchContext()]);
      setLoading(false);
    };
    load();
  }, [fetchCases, fetchContext]);

  const grouped = useMemo(() => ({
    active: cases.filter((item) => !["RESOLVED", "REJECTED"].includes(item.status)),
    closed: cases.filter((item) => ["RESOLVED", "REJECTED"].includes(item.status)),
  }), [cases]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      let evidenceUrl = "";
      if (evidence) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", evidence);
        const uploadRes = await api.post<{ url: string }>(ENDPOINTS.UPLOAD.DOCUMENT, uploadData);
        evidenceUrl = uploadRes.url;
      }

      await api.post<CaseRecord>(ENDPOINTS.DISPUTES.BASE, {
        case_type: selectedCategory.type,
        category: form.category,
        title: form.title.trim(),
        reason: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        property_id: form.property_id || undefined,
        reported_user_id: selectedCategory.id.startsWith("REPORT_") ? selectedProperty?.reportedUserId : undefined,
        evidence_url: evidenceUrl,
      });

      toast.success(selectedCategory.type === "SUPPORT" ? "Support ticket opened." : "Dispute opened.");
      setForm({ category: "GENERAL_SUPPORT", title: "", description: "", priority: "MEDIUM", property_id: "" });
      setEvidence(null);
      await fetchCases();
    } catch (err) {
      console.error("Failed to open case", err);
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Case Center</p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">{MODE_COPY[mode].title}</h1>
          <p className="max-w-2xl text-sm font-light text-gray-500">{MODE_COPY[mode].intro}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Open" value={grouped.active.length} />
          <Metric label="Closed" value={grouped.closed.length} />
          <Metric label="Total" value={cases.length} />
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-[#0A0A0A] p-6 lg:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {selectedCategory.type === "SUPPORT" ? <LifeBuoy size={22} /> : <ShieldAlert size={22} />}
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white">Open A Case</h2>
              <p className="text-xs text-gray-500">Support goes to the platform team. Disputes attach the relevant property party when available.</p>
            </div>
          </div>

          <CustomSelect
            label="Category"
            value={form.category}
            onChange={(value) => setForm((current) => ({ ...current, category: value }))}
            options={CATEGORY_OPTIONS[mode].map((item) => ({ id: item.id, label: item.label }))}
            icon={<AlertTriangle size={15} />}
          />

          <CustomSelect
            label="Related Property"
            value={form.property_id}
            onChange={(value) => setForm((current) => ({ ...current, property_id: value }))}
            options={[{ id: "", label: "No specific property" }, ...propertyOptions]}
            icon={<Building2 size={15} />}
          />

          <CustomSelect
            label="Priority"
            value={form.priority}
            onChange={(value) => setForm((current) => ({ ...current, priority: value }))}
            options={PRIORITY_OPTIONS}
            icon={<AlertTriangle size={15} />}
          />

          <div className="space-y-2">
            <label className="pl-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Title</label>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white outline-none transition-all focus:border-primary/50"
              placeholder="Short case title"
            />
          </div>

          <div className="space-y-2">
            <label className="pl-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Details</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={5}
              className="w-full resize-none rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition-all focus:border-primary/50"
              placeholder="Explain what happened and what outcome you expect."
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-gray-400 transition-all hover:border-primary/40">
            <span className="flex min-w-0 items-center gap-3">
              <Upload size={18} className="text-primary" />
              <span className="truncate">{evidence ? evidence.name : "Attach evidence"}</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Choose</span>
            <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={(event) => setEvidence(event.target.files?.[0] || null)} />
          </label>

          <button
            disabled={submitting || uploading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
            {uploading ? "Uploading Evidence" : "Submit Case"}
          </button>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-[#0A0A0A] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 p-6 lg:p-8">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">My Cases</h2>
              <p className="text-xs text-gray-500">Recent support tickets and disputes.</p>
            </div>
            {loading && <Loader2 size={18} className="animate-spin text-primary" />}
          </div>

          <div className="max-h-[720px] overflow-y-auto">
            {cases.map((item) => (
              <article key={item.id} className="border-b border-white/5 p-6 last:border-b-0">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest", item.case_type === "SUPPORT" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" : "border-primary/20 bg-primary/10 text-primary")}>
                        {item.case_type || "DISPUTE"}
                      </span>
                      <span className={cn("rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest", statusStyles[item.status] || "border-white/10 bg-white/5 text-gray-400")}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white">{item.title || item.reason}</h3>
                    <p className="line-clamp-2 text-sm text-gray-500">{item.description}</p>
                    <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-gray-600">
                      <span>{item.category?.replaceAll("_", " ") || "General"}</span>
                      <span>{item.priority || "MEDIUM"}</span>
                      {item.property?.title && <span>{item.property.title}</span>}
                      {(item.respondent || item.reported_user) && <span>Against {nameOf(item.reported_user || item.respondent)}</span>}
                    </div>
                    {(item.response || item.resolution) && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">
                        {item.resolution || item.response}
                      </div>
                    )}
                  </div>
                  {item.evidence_url && (
                    <a href={item.evidence_url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-primary hover:bg-white/5">
                      <FileText size={14} /> Evidence
                    </a>
                  )}
                </div>
              </article>
            ))}

            {!loading && cases.length === 0 && (
              <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8 text-center">
                <CheckCircle2 size={36} className="text-primary" />
                <p className="max-w-sm text-sm text-gray-500">No support cases yet.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

function getErrorMessage(err: unknown) {
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

  return "Failed to submit case.";
}
