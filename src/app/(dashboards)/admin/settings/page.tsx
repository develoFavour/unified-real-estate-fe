"use client";

import { useState } from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  ShieldCheck, 
  Palette,
  Save
} from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";

const CURRENCY_OPTIONS = [
  { id: "USD", label: "USD ($)" },
  { id: "EUR", label: "EUR" },
  { id: "GBP", label: "GBP" },
  { id: "NGN", label: "NGN" },
];

export default function AdminSettingsPage() {
  const [currency, setCurrency] = useState("NGN");

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-heading">System Settings</h1>
        <p className="text-gray-500 font-light">Configure platform-wide parameters, security policies, and theme preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Tabs */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { label: "General", icon: Globe, active: true },
            { label: "Profile Info", icon: User, active: false },
            { label: "Security", icon: Lock, active: false },
            { label: "Notifications", icon: Bell, active: false },
            { label: "Permissions", icon: ShieldCheck, active: false },
            { label: "Appearance", icon: Palette, active: false },
          ].map((tab, i) => (
            <button 
              key={i} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                tab.active ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon size={20} />
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Settings Form */}
        <main className="lg:col-span-9 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-12">
          {/* Platform Config */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold font-heading">General Platform Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Platform Name</label>
                <input type="text" defaultValue="The Property Luxury Real Estate" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Support Email</label>
                <input type="email" defaultValue="support@theproperty.com" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Commission Rate (%)</label>
                <input type="number" defaultValue="5" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Currency</label>
                <CustomSelect
                  value={currency}
                  onChange={setCurrency}
                  options={CURRENCY_OPTIONS}
                  icon={<Globe size={15} />}
                />
                {/*
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>NGN (₦)</option>
                */}
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="pt-12 border-t border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="font-bold text-white">Maintenance Mode</h4>
                <p className="text-sm text-gray-500 font-light">Disable all public listings and authentication temporarily.</p>
              </div>
              <button className="w-12 h-6 bg-white/10 rounded-full relative p-1 group">
                <div className="w-4 h-4 bg-gray-500 rounded-full group-hover:bg-gray-400 transition-all"></div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-12 border-t border-white/5 flex justify-end">
            <button className="flex items-center gap-3 bg-primary text-black px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 hover:bg-primary-hover">
              <Save size={20} />
              Save System Configuration
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
