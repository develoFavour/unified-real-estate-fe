"use client";

import { LucideIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function RoleCard({ id, title, description, icon: Icon, selected, onSelect }: RoleCardProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "flex flex-col items-center text-center p-8 rounded-3xl border-2 transition-all duration-300 group relative overflow-hidden",
        selected 
          ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(193,155,118,0.1)]" 
          : "border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]"
      )}
    >
      {selected && (
        <div className="absolute top-4 right-4 text-primary animate-in zoom-in duration-300">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )}
      <div className={cn(
        "p-4 rounded-2xl mb-6 transition-colors",
        selected ? "bg-primary text-black" : "bg-white/5 text-gray-400 group-hover:text-primary"
      )}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed font-light">{description}</p>
    </button>
  );
}
