"use client";

import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Image as ImageIcon, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Upload,
  UserPlus,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/custom-select";

const steps = [
  { id: 1, title: "Identity", icon: Building2 },
  { id: 2, title: "Pricing", icon: DollarSign },
  { id: 3, title: "Media", icon: ImageIcon },
  { id: 4, title: "Authority", icon: FileText },
];

const PROPERTY_CATEGORY_OPTIONS = [
  { id: "SELF_CONTAIN", label: "Self Contain" },
  { id: "2_BEDROOM", label: "2 Bedroom Flat" },
  { id: "3_BEDROOM", label: "3 Bedroom Flat" },
  { id: "DUPLEX", label: "Duplex" },
  { id: "OFFICE", label: "Office Space" },
];

export default function NewListingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyCategory, setPropertyCategory] = useState("SELF_CONTAIN");
  const [rent, setRent] = useState<number>(0);

  // Nigerian Total Package Calculations
  const agency = rent * 0.1;
  const legal = rent * 0.05;
  const caution = rent * 0.1;
  const total = rent + agency + legal + caution;

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Progress Stepper */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 -z-10"></div>
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3 bg-[#050505] px-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                currentStep >= step.id 
                  ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(193,155,118,0.3)]" 
                  : "bg-white/5 border-white/10 text-gray-500"
              )}>
                <step.icon size={20} />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors",
                currentStep >= step.id ? "text-primary" : "text-gray-600"
              )}>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
        
        {/* Step 1: Property Identity */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading">Property Identity</h2>
              <p className="text-gray-500 font-light">Tell us what kind of property you are listing.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Property Title</label>
                <input type="text" placeholder="e.g. Modern 3 Bedroom Apartment" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Property Category</label>
                <CustomSelect
                  value={propertyCategory}
                  onChange={setPropertyCategory}
                  options={PROPERTY_CATEGORY_OPTIONS}
                  icon={<Building2 size={15} />}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input type="text" placeholder="123 Luxury Ave, Victoria Island, Lagos" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Description</label>
                <textarea rows={4} placeholder="Describe the unique features, amenities, and surroundings..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Fees */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading">Pricing & Fees</h2>
              <p className="text-gray-500 font-light">Set the rent and our system will calculate the total move-in cost.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Annual Rent (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₦</span>
                    <input 
                      type="number" 
                      onChange={(e) => setRent(Number(e.target.value))}
                      placeholder="5,000,000" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 focus:outline-none focus:border-primary/50 transition-all text-xl font-bold font-heading" 
                    />
                  </div>
                </div>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-tighter">
                    <Info size={14} /> Note on Nigerian Standards
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    By default, we apply a 10% Agency fee and a 5% Legal fee. These can be adjusted by the Super Admin during final approval.
                  </p>
                </div>
              </div>

              {/* Package Breakdown Visual */}
              <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Estimated Total Package</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Annual Rent</span>
                    <span className="font-bold">₦{rent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Agency (10%)</span>
                    <span className="font-bold text-primary">₦{agency.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Legal/Agreement (5%)</span>
                    <span className="font-bold">₦{legal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Caution Deposit</span>
                    <span className="font-bold">₦{caution.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-primary/20 flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
                    <span className="text-3xl font-bold font-heading text-primary">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Media */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading">Photos & Media</h2>
              <p className="text-gray-500 font-light">Upload high-quality images to attract luxury tenants.</p>
            </div>
            <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-20 flex flex-col items-center justify-center space-y-6 group hover:border-primary/40 transition-all cursor-pointer">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">Drag & drop your photos</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP up to 10MB each. Minimum 5 photos.</p>
              </div>
              <button className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                Browse Files
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Authority Link */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading">Ownership & Authority</h2>
              <p className="text-gray-500 font-light">Link this property to an owner and provide proof of listing authority.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Link Property Owner</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input type="text" placeholder="Search by Email or Phone..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-primary/50 transition-all" />
                  </div>
                  <p className="text-[10px] text-gray-600 pl-4 italic">If the owner is not on the platform, we will send them an invite.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Authority to Lease (PDF/JPG)</label>
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 hover:border-primary/40 transition-all cursor-pointer">
                    <FileText size={24} className="text-gray-600" />
                    <p className="text-[10px] font-bold uppercase text-gray-500">Upload Letter of Authority</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-primary" />
                  <h4 className="font-bold text-white">Trust & Verification</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  To prevent unauthorized listings, the **Authority to Lease** document is required. This will be verified by our Admin team before the listing goes live.
                </p>
                <ul className="space-y-3">
                  {["Signed by Property Owner", "Clearly states property address", "Valid for current date range"].map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      <CheckCircle2 size={12} className="text-primary" /> {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-16 pt-8 border-t border-white/5 flex justify-between">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 text-gray-500 hover:text-white disabled:opacity-0 transition-all font-bold text-sm"
          >
            <ArrowLeft size={18} /> Previous Step
          </button>
          
          {currentStep < steps.length ? (
            <button 
              onClick={nextStep}
              className="bg-primary text-black px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-3"
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <Link 
              href="/agent/listings"
              className="bg-primary text-black px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-3"
            >
              Publish Listing <CheckCircle2 size={18} />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
