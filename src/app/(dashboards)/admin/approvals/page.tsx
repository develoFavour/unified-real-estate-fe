import { CheckCircle, XCircle, FileText, ExternalLink, Mail, Phone } from "lucide-react";

const pendingAgents = [
  { 
    id: "1", 
    name: "Robert Fox", 
    email: "robert@foxrealty.com", 
    phone: "+1 234 567 890",
    agency: "Fox Realty", 
    license: "RE-98234-X",
    joined: "2 hours ago",
    document: "license_fox.pdf"
  },
  { 
    id: "2", 
    name: "Jane Cooper", 
    email: "jane@primeestates.com", 
    phone: "+1 987 654 321",
    agency: "Prime Estates", 
    license: "RE-12093-Y",
    joined: "5 hours ago",
    document: "license_cooper.pdf"
  },
  { 
    id: "3", 
    name: "Cody Fisher", 
    email: "cody@urbanliving.io", 
    phone: "+1 555 444 333",
    agency: "Urban Living", 
    license: "RE-44556-Z",
    joined: "Yesterday",
    document: "license_fisher.pdf"
  },
];

export default function AgentApprovalsPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-heading">Agent Approvals</h1>
        <p className="text-gray-500 font-light">Verify and approve new estate agents to grant them listing privileges.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingAgents.map((agent) => (
          <div key={agent.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all group">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              {/* Agent Profile Info */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{agent.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{agent.agency}</p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Mail size={12} className="text-primary" /> {agent.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Phone size={12} className="text-primary" /> {agent.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* License & Document */}
              <div className="flex flex-wrap items-center gap-8 lg:border-l lg:border-white/5 lg:pl-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">License Number</p>
                  <p className="text-sm font-mono text-gray-200">{agent.license}</p>
                </div>
                <button className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all text-gray-300">
                  <FileText size={16} className="text-primary" />
                  View Documents
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 w-full lg:w-auto">
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary text-black px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                  <CheckCircle size={18} />
                  Approve
                </button>
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all">
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <span>Request Date: {agent.joined}</span>
              <span className="text-primary/60 italic">Verification Required</span>
            </div>
          </div>
        ))}

        {pendingAgents.length === 0 && (
          <div className="py-24 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
            <p className="text-gray-500 font-light italic">No pending agent approvals at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
