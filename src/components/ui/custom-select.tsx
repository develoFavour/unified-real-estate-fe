"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode | null;
  emptyLabel?: string;
  size?: "default" | "compact";
  className?: string;
}

export function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option", 
  label,
  icon = <Building2 size={16} />,
  emptyLabel = "No available options found.",
  size = "default",
  className
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-2 relative", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group flex w-full items-center gap-3 border bg-white/[0.04] text-left transition-all hover:bg-white/[0.07]",
            size === "compact"
              ? "h-10 rounded-xl pl-3 pr-9 text-xs"
              : "h-14 rounded-2xl pl-4 pr-11 text-sm",
            isOpen ? "border-primary/50 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(193,155,118,0.1)]" : "border-white/10",
            !selectedOption && "text-gray-500"
          )}
        >
          {icon !== null && (
            <span className={cn(
              "flex shrink-0 items-center justify-center bg-white/[0.04] text-gray-500 transition-colors",
              size === "compact" ? "h-6 w-6 rounded-lg" : "h-8 w-8 rounded-xl",
              isOpen && "bg-primary/10 text-primary"
            )}>
              {icon}
            </span>
          )}
          <span className={cn("min-w-0 flex-1 truncate font-semibold", selectedOption && "text-white")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>
        <ChevronDown
          size={16}
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-500 transition-transform duration-300",
            size === "compact" ? "right-3" : "right-4",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </div>

      {/* Options Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 z-[110] mt-2 max-h-72 w-full overflow-hidden border border-white/10 bg-[#101010] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200",
          size === "compact" ? "rounded-xl" : "rounded-2xl"
        )}>
          {options.length === 0 ? (
            <div className="px-6 py-4 text-xs text-gray-600 italic">{emptyLabel}</div>
          ) : (
            <div className="max-h-68 overflow-y-auto pr-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl text-left transition-all hover:bg-primary/10 hover:text-primary",
                  size === "compact" ? "min-h-9 px-2.5 py-2 text-xs" : "min-h-11 px-3 py-2.5 text-sm",
                  value === option.id ? "bg-primary/10 text-primary" : "text-gray-400"
                )}
              >
                {icon !== null && (
                  <span className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg bg-white/[0.04]",
                    size === "compact" ? "h-6 w-6" : "h-7 w-7",
                    value === option.id ? "text-primary" : "text-gray-600"
                  )}>
                    {icon}
                  </span>
                )}
                  <span className="min-w-0 flex-1 truncate font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
