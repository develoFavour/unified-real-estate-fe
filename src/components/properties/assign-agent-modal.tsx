"use client";

import { useEffect, useState } from "react";
import {
  X,
  Mail,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Send,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

interface Property {
  id: string;
  title: string;
  agent_id?: string | null;
}

interface Agent {
  id: string;
  email: string;
  profile?: {
    full_name?: string;
    agency_name?: string;
  };
}

interface AssignAgentModalProps {
  propertyId?: string;
  propertyName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialEmail?: string;
  agentId?: string | null;
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

  return "Something went wrong";
}

export function AssignAgentModal({
  propertyId: initialPropertyId,
  isOpen,
  onClose,
  onSuccess,
  initialEmail = "",
  agentId = null,
}: AssignAgentModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [selectedAgentEmail, setSelectedAgentEmail] = useState(initialEmail);
  const [inviteMode, setInviteMode] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId || "");
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAgents = async () => {
      setLoadingAgents(true);
      try {
        const data = await api.get<Agent[]>(ENDPOINTS.AUTH.VERIFIED_AGENTS);
        setAgents(data || []);
      } catch (err) {
        console.error("Failed to fetch verified agents", err);
        toast.error("Failed to load verified agents.");
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialPropertyId) return;

    const fetchProps = async () => {
      try {
        const data = await api.get<Property[]>(ENDPOINTS.PROPERTIES.ME);
        const available = data.filter(p => p.agent_id !== agentId);
        setProperties(available || []);
      } catch (err) {
        console.error("Failed to fetch properties", err);
      }
    };

    fetchProps();
  }, [isOpen, initialPropertyId, agentId]);

  if (!isOpen) return null;

  const agentOptions = agents.map(agent => {
    const name = agent.profile?.full_name || agent.email;
    const agency = agent.profile?.agency_name;

    return {
      id: agent.email,
      label: agency ? `${name} - ${agency}` : `${name} - ${agent.email}`,
    };
  });

  const effectiveAgentEmail = selectedAgentEmail || initialEmail || agents[0]?.email || "";
  const selectedAgent = agents.find(agent => agent.email === effectiveAgentEmail);
  const assignmentEmail = inviteMode ? email.trim() : effectiveAgentEmail;
  const effectivePropertyId = initialPropertyId || selectedPropertyId;
  const canSubmit = Boolean(assignmentEmail) && Boolean(effectivePropertyId);

  const resetAndClose = () => {
    setError(null);
    setSuccess(false);
    setInviteMode(false);
    setSelectedPropertyId("");
    setSelectedAgentEmail("");
    setEmail("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPropId = effectivePropertyId;

    if (!finalPropId) {
      setError("Please select a property first");
      return;
    }

    if (!assignmentEmail) {
      setError(inviteMode ? "Please enter the agent's email address" : "Please select an agent");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post<null>(`/properties/${finalPropId}/assign-agent`, { email: assignmentEmail });
      setSuccess(true);
      toast.success(inviteMode ? "Invitation sent successfully!" : "Mandate offer sent successfully!");

      setTimeout(() => {
        if (onSuccess) onSuccess();
        resetAndClose();
      }, 2000);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={resetAndClose} />

      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-heading tracking-tight">Recruit Agent</h3>
              <p className="text-xs text-gray-500">Professional property management assignment.</p>
            </div>
            <button onClick={resetAndClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {success ? (
            <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-bold">Offer Sent!</h4>
              <p className="text-xs text-gray-500">The agent must accept before management begins.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {!initialPropertyId && (
                <CustomSelect
                  label="Target Asset"
                  placeholder="Which property should they manage?"
                  value={selectedPropertyId}
                  onChange={setSelectedPropertyId}
                  options={properties.map(p => ({ id: p.id, label: p.title }))}
                  emptyLabel="No assignable properties found."
                />
              )}

              {inviteMode ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Agent Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="agent@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteMode(false);
                      setError(null);
                    }}
                    className="text-xs font-bold text-primary hover:text-primary-hover transition-colors pl-4"
                  >
                    Choose from verified agents instead
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <CustomSelect
                    label="Agent"
                    placeholder={loadingAgents ? "Loading verified agents..." : "Select an existing agent"}
                    value={effectiveAgentEmail}
                    onChange={setSelectedAgentEmail}
                    options={agentOptions}
                    icon={<UserRoundCheck size={16} />}
                    emptyLabel="No verified agents found."
                  />
                  {selectedAgent && (
                    <p className="text-[10px] text-gray-500 pl-4">
                      Assignment will be sent to {selectedAgent.email}.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setInviteMode(true);
                      setError(null);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors pl-4"
                  >
                    <UserPlus size={14} /> Invite a new agent
                  </button>
                </div>
              )}

              {error && <p className="text-[10px] text-red-500 font-bold pl-4">{error}</p>}

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  The agent will receive a mandate offer. They will gain access once they officially accept the management terms.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || loadingAgents || !canSubmit}
                className={cn(
                  "w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs",
                  loading || loadingAgents || !canSubmit
                    ? "bg-white/5 text-gray-600 cursor-not-allowed"
                    : "bg-primary text-black hover:bg-primary-hover shadow-lg shadow-primary/20"
                )}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send size={16} /> {inviteMode ? "Send Invitation" : "Send Mandate Offer"}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
