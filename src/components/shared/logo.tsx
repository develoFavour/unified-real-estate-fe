import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const heights = {
    sm: { h1: "h-3", h2: "h-5", h3: "h-6" },
    md: { h1: "h-4", h2: "h-6", h3: "h-8" },
    lg: { h1: "h-6", h2: "h-10", h3: "h-12" },
  };

  const curr = heights[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-end gap-1 mb-1">
        <div className={cn("w-1 bg-primary rounded-t-sm", curr.h1)}></div>
        <div className={cn("w-1.5 bg-primary rounded-t-sm", curr.h2)}></div>
        <div className={cn("w-1.5 bg-primary rounded-t-sm", curr.h3)}></div>
        <div className={cn("w-1.5 bg-primary rounded-t-sm", curr.h2)}></div>
        <div className={cn("w-1 bg-primary rounded-t-sm", curr.h1)}></div>
      </div>
      <span className={cn(
        "tracking-[0.3em] font-semibold uppercase text-gray-400 font-heading",
        size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : "text-xs"
      )}>
        The Property
      </span>
    </div>
  );
}
