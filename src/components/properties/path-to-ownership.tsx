"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, Target, Loader2, Home } from "lucide-react";
import { api } from "@/lib/api/methods";
import { cn } from "@/lib/utils";

interface SavingTimeline {
  target_amount: number;
  current_balance: number;
  monthly_saving: number;
  months_remaining: number;
  percentage: number;
  property_title: string;
}

export function PathToOwnership({ propertyId }: { propertyId: string }) {
  const [data, setData] = useState<SavingTimeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<SavingTimeline>(`/wallet/saving-timeline?property_id=${propertyId}`);
        setData(res);
      } catch (err) {
        console.error("Failed to load saving timeline");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-primary/10 via-black to-black border border-primary/20 p-8 rounded-[2rem] shadow-2xl space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Path to Ownership</h4>
          <p className="text-xl font-bold font-heading">{data.property_title}</p>
        </div>
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
          <Home size={20} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <p className="text-3xl font-bold font-heading">₦{data.current_balance.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-medium">Goal: ₦{data.target_amount.toLocaleString()}</p>
        </div>
        
        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(193,155,118,0.5)]"
            style={{ width: `${Math.min(100, data.percentage)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
          <span>{data.percentage.toFixed(1)}% Achieved</span>
          <span>₦{(data.target_amount - data.current_balance).toLocaleString()} left</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Monthly Saving</span>
          </div>
          <p className="font-bold">₦{data.monthly_saving.toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Calendar size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Timeline</span>
          </div>
          <p className="font-bold">{data.months_remaining.toFixed(1)} Months</p>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/10 p-4 rounded-2xl flex items-start gap-4">
        <Target size={18} className="text-primary shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
          At your current income and saving rate, you are on track to meet the downpayment in **{data.months_remaining.toFixed(1)} months**. 
          You can speed this up by increasing your saving percentage in your profile.
        </p>
      </div>
    </div>
  );
}
