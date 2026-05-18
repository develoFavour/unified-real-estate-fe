"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, FileText, Loader2, Upload } from "lucide-react";
import { api } from "@/lib/api/methods";
import { toast } from "sonner";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";

interface TransactionDocument {
  id: string;
  title: string;
  type: string;
  document_url: string;
  created_at: string;
}

interface LeaseTarget {
  key: string;
  label: string;
  lease_id?: string | null;
}

const REQUIRED_LEASE_DOCUMENTS = [
  { id: "LEASE_AGREEMENT", label: "Lease Agreement", description: "Signed or prepared tenancy/lease agreement." },
  { id: "INSPECTION", label: "Inspection Report", description: "Move-in inspection or property condition evidence." },
  { id: "HANDOVER_NOTE", label: "Handover Note", description: "Keys, access, meter readings, or possession handover note." },
  { id: "ID_VERIFICATION", label: "ID Verification", description: "Tenant/owner identity or verification evidence." },
];

const getDocumentLabel = (type: string) => {
  return REQUIRED_LEASE_DOCUMENTS.find((document) => document.id === type)?.label || type.replaceAll("_", " ");
};

export function TenantLeaseDocumentsPanel({ leaseId, accepted, onAccepted }: { leaseId: string; accepted?: boolean; onAccepted?: () => void }) {
  const [documents, setDocuments] = useState<TransactionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(Boolean(accepted));

  const fetchDocuments = useCallback(async () => {
    const docs = await api.get<TransactionDocument[]>("/transaction-documents", { lease_id: leaseId });
    setDocuments(docs || []);
  }, [leaseId]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchDocuments()
        .catch((err) => console.error("Failed to fetch lease documents", err))
        .finally(() => setLoading(false));
    });
  }, [fetchDocuments]);

  const acceptDocuments = async () => {
    setAccepting(true);
    try {
      await api.post(`/leases/${leaseId}/accept-documents`, {});
      setIsAccepted(true);
      toast.success("Lease documents acknowledged.");
      onAccepted?.();
    } catch (err) {
      console.error("Failed to acknowledge lease documents", err);
      toast.error("Unable to acknowledge documents.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || documents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Lease Documents
          </h3>
          <p className="text-xs text-gray-500 mt-1">Review uploaded lease and handover evidence before acknowledgement.</p>
        </div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{documents.length} files</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {documents.map((document) => (
          <a
            key={document.id}
            href={document.document_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/30 transition-colors"
          >
            <FileText size={16} className="text-primary" />
            <div>
              <p className="text-sm font-bold text-white">{document.title}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{document.type.replaceAll("_", " ")}</p>
            </div>
          </a>
        ))}
      </div>
      <button
        onClick={acceptDocuments}
        disabled={accepting || isAccepted}
        className="inline-flex items-center justify-center gap-2 bg-primary text-black px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50"
      >
        {accepting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        {isAccepted ? "Documents Acknowledged" : "Acknowledge Documents"}
      </button>
    </div>
  );
}

export function StakeholderLeaseDocumentsPanel({ targets }: { targets: LeaseTarget[] }) {
  const [documents, setDocuments] = useState<TransactionDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [form, setForm] = useState({
    target: "",
    title: "",
    type: "LEASE_AGREEMENT",
    document_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const eligibleTargets = targets.filter((target) => target.lease_id);
  const selectedTarget = eligibleTargets.find((item) => item.key === form.target);
  const targetOptions = eligibleTargets.map((target) => ({ id: target.key, label: target.label }));
  const documentTypeOptions = REQUIRED_LEASE_DOCUMENTS.map((document) => ({ id: document.id, label: document.label }));
  const uploadedTypes = new Set(documents.map((document) => document.type));
  const missingDocuments = REQUIRED_LEASE_DOCUMENTS.filter((document) => !uploadedTypes.has(document.id));

  const fetchDocuments = useCallback(async (leaseId: string) => {
    setLoadingDocuments(true);
    try {
      const docs = await api.get<TransactionDocument[]>("/transaction-documents", { lease_id: leaseId });
      setDocuments(docs || []);
    } catch (err) {
      console.error("Failed to fetch lease documents", err);
      toast.error("Unable to load lease document checklist.");
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedTarget?.lease_id) {
      queueMicrotask(() => setDocuments([]));
      return;
    }

    queueMicrotask(() => {
      fetchDocuments(selectedTarget.lease_id as string);
    });
  }, [fetchDocuments, selectedTarget?.lease_id]);

  const uploadDocument = async () => {
    if (!selectedTarget?.lease_id || !form.title || !form.document_url) {
      toast.error("Select a lease, choose a document, and upload a file.");
      return;
    }
    setUploading(true);
    try {
      await api.post("/transaction-documents", {
        lease_id: selectedTarget.lease_id,
        title: form.title,
        type: form.type,
        document_url: form.document_url,
      });
      setForm((current) => ({ ...current, title: "", document_url: "" }));
      await fetchDocuments(selectedTarget.lease_id);
      toast.success("Lease document uploaded.");
    } catch (err) {
      console.error("Failed to upload lease document", err);
      toast.error("Failed to upload lease document.");
    } finally {
      setUploading(false);
    }
  };

  const uploadDocumentFile = async (file?: File) => {
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<{ url: string }>("/upload/document", formData);
      setForm((current) => ({
        ...current,
        title: current.title || getDocumentLabel(current.type),
        document_url: res.url,
      }));
      toast.success("Document uploaded to Cloudinary.");
    } catch (err) {
      console.error("Failed to upload document file", err);
      toast.error("Document upload failed.");
    } finally {
      setUploadingFile(false);
    }
  };

  if (eligibleTargets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Upload Lease Evidence
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Select a lease, complete the required document checklist, then the tenant can acknowledge the lease.
          </p>
        </div>
        {selectedTarget?.lease_id && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Checklist</p>
            <p className="text-sm font-bold text-white mt-1">
              {documents.length}/{REQUIRED_LEASE_DOCUMENTS.length} uploaded
            </p>
          </div>
        )}
      </div>

      {selectedTarget?.lease_id && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {REQUIRED_LEASE_DOCUMENTS.map((requiredDocument) => {
            const uploadedDocument = documents.find((document) => document.type === requiredDocument.id);
            const isUploaded = Boolean(uploadedDocument);
            return (
              <div
                key={requiredDocument.id}
                className={cn(
                  "rounded-2xl border p-4 transition-colors",
                  isUploaded
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-white/[0.03] border-white/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    isUploaded ? "bg-green-500/10 text-green-500" : "bg-white/5 text-gray-500"
                  )}>
                    {isUploaded ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{requiredDocument.label}</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1">{requiredDocument.description}</p>
                    {uploadedDocument ? (
                      <a
                        href={uploadedDocument.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex mt-3 text-[10px] font-black uppercase tracking-widest text-green-500 hover:text-green-400"
                      >
                        View uploaded
                      </a>
                    ) : (
                      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-primary">Still needed</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTarget?.lease_id && missingDocuments.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Left to upload</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            {missingDocuments.map((document) => document.label).join(", ")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <CustomSelect
            value={form.target}
            onChange={(value) => setForm((current) => ({ ...current, target: value }))}
            options={targetOptions}
            placeholder="Select tenant lease"
            icon={<FileText size={16} />}
          />
        </div>
        <CustomSelect
          value={form.type}
          onChange={(value) => setForm((current) => ({
            ...current,
            type: value,
            title: current.title || getDocumentLabel(value),
          }))}
          options={documentTypeOptions}
          placeholder="Document type"
          icon={<FileText size={16} />}
        />
        <input
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="Document title"
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
        />
        <label className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none cursor-pointer flex items-center justify-center gap-2 hover:border-primary/30 transition-colors">
          {uploadingFile ? <Loader2 size={14} className="animate-spin text-primary" /> : <Upload size={14} className="text-primary" />}
          <span className="truncate">{form.document_url ? "Uploaded" : "Choose File"}</span>
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(event) => uploadDocumentFile(event.target.files?.[0])}
          />
        </label>
      </div>
      <button
        onClick={uploadDocument}
        disabled={uploading || uploadingFile || loadingDocuments || !selectedTarget?.lease_id}
        className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-60"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
        Upload Document
      </button>
    </div>
  );
}
