import { 
  Building2, 
  MapPin, 
  User as UserIcon, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Filter,
  Search
} from "lucide-react";
import Image from "next/image";

const properties = [
  {
    id: "1",
    title: "Villa Marittima",
    location: "Málaga, Spain",
    price: "$12.4M",
    status: "Leased",
    owner: "Alice Smith",
    agent: "Robert Fox",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"
  },
  {
    id: "2",
    title: "The Glass House",
    location: "Beverly Hills, CA",
    price: "$24.0M",
    status: "Available",
    owner: "Mark Johnson",
    agent: "Jane Cooper",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "3",
    title: "Modernist Retreat",
    location: "Zermatt, Switzerland",
    price: "$8.9M",
    status: "Maintenance",
    owner: "Sophia Lorenz",
    agent: "Cody Fisher",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "4",
    title: "Oceanfront Penthouse",
    location: "Miami Beach, FL",
    price: "$15.2M",
    status: "Leased",
    owner: "David Chen",
    agent: "Robert Fox",
    image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=2071&auto=format&fit=crop"
  }
];

export default function AdminPropertiesPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Property Portfolio</h1>
          <p className="text-gray-500 font-light">Monitor and manage all property listings across the system.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search ID, title..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Filter size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {properties.map((prop) => (
          <div key={prop.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col sm:flex-row group hover:bg-white/[0.04] transition-all">
            <div className="relative w-full sm:w-48 h-48 sm:h-auto">
              <Image src={prop.image} alt={prop.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md border ${
                  prop.status === "Available" ? "bg-green-500/20 text-green-500 border-green-500/20" :
                  prop.status === "Leased" ? "bg-primary/20 text-primary border-primary/20" :
                  "bg-orange-500/20 text-orange-500 border-orange-500/20"
                }`}>
                  {prop.status}
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold font-heading mb-1">{prop.title}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={12} className="text-primary" /> {prop.location}
                  </p>
                </div>
                <button className="text-gray-500 hover:text-white p-1">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Owner</p>
                  <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <UserIcon size={14} className="text-primary/60" /> {prop.owner}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Managed By</p>
                  <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary/60" /> {prop.agent}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-2xl font-bold font-heading text-primary">{prop.price}</p>
                <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                  View Full Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
