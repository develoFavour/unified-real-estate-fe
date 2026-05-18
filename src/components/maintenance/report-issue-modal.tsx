"use client";

import { useState } from "react";
import { 
  X, 
  Loader2, 
  CheckCircle2, 
  Droplets, 
  Zap, 
  Hammer, 
  ShieldAlert,
  Send,
  HelpCircle,
  Upload,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { cn } from "@/lib/utils";

interface ReportIssueModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { id: "PLUMBING", label: "Plumbing", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "ELECTRICAL", label: "Electrical", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "SECURITY", label: "Security", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "GENERAL", label: "General Repair", icon: Hammer, color: "text-primary", bg: "bg-primary/10" },
  { id: "OTHER", label: "Other", icon: HelpCircle, color: "text-gray-400", bg: "bg-white/5" },
];

const PRIORITIES = [
  { id: "LOW", label: "Low", color: "bg-gray-500" },
  { id: "MEDIUM", label: "Medium", color: "bg-blue-500" },
  { id: "HIGH", label: "High", color: "bg-orange-500" },
  { id: "URGENT", label: "Urgent", color: "bg-red-500" },
];

export function ReportIssueModal({ propertyId, isOpen, onClose, onSuccess }: ReportIssueModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    priority: "MEDIUM",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      if (evidence) {
        const uploadData = new FormData();
        uploadData.append("file", evidence);
        const uploadRes = await api.post<{ url: string }>("/upload/document", uploadData);
        imageUrl = uploadRes.url;
      }

      await api.post("/maintenance", {
        ...formData,
        property_id: propertyId,
        image_url: imageUrl,
      });
      setSuccess(true);
      toast.success("Maintenance request submitted!");
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccess(false);
        setEvidence(null);
        setFormData({ title: "", description: "", category: "GENERAL", priority: "MEDIUM" });
      }, 2000);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0A0A] shadow-2xl animate-in zoom-in duration-300">
        <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8 lg:p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-heading tracking-tight text-white">Report an Issue</h3>
              <p className="text-sm text-gray-500 font-light">What needs attention in your home?</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          {success ? (
            <div className="py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white">Request Received</h4>
                <p className="text-gray-500 font-light max-w-xs mx-auto">We have notified the management team. They will update you shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Category</label>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={cn(
                        "flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition-all",
                        formData.category === cat.id 
                          ? "bg-primary/10 border-primary/50 text-primary" 
                          : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/[0.08]"
                      )}
                    >
                      <cat.icon size={28} />
                      <span className="text-xs font-bold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

                <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Kitchen tap is leaking"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary/50 transition-all text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide as much detail as possible..."
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 px-6 text-sm focus:outline-none focus:border-primary/50 transition-all text-white resize-none"
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Priority Level</label>
                <div className="flex flex-wrap gap-3">
                  {PRIORITIES.map((prio) => (
                    <button
                      key={prio.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: prio.id })}
                      className={cn(
                        "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                        formData.priority === prio.id 
                          ? `${prio.color} text-white border-transparent` 
                          : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                      )}
                    >
                      {prio.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Evidence</label>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-400 transition-all hover:border-primary/40 hover:bg-white/[0.08]">
                  <span className="flex min-w-0 items-center gap-3">
                    {evidence ? <FileText size={18} className="text-primary" /> : <Upload size={18} className="text-gray-500" />}
                    <span className="truncate">{evidence ? evidence.name : "Attach photo, PDF, or document"}</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Choose</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(event) => setEvidence(event.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <button 
                type="submit"
                disabled={loading || !formData.title || !formData.description}
                className={cn(
                  "w-full py-5 rounded-[2rem] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-2xl",
                  loading || !formData.title || !formData.description
                    ? "bg-white/5 text-gray-600 cursor-not-allowed" 
                    : "bg-primary text-black hover:bg-primary-hover shadow-primary/20"
                )}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send size={18} /> Submit Request</>}
              </button>
            </form>
          )}
        </div>
      </div>
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

  return "Failed to submit request";
}
