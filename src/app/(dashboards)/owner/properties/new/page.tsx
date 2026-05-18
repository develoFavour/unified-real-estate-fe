"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Currency,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus
} from "lucide-react";
import dynamic from "next/dynamic";
import { FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { AssignAgentModal } from "@/components/properties/assign-agent-modal";
import { CustomSelect } from "@/components/ui/custom-select";

// Validation Schema
const propertySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  property_type: z.enum(["APARTMENT", "SELF_CONTAIN", "TERRACE", "DUPLEX", "OFFICE", "COMMERCIAL", "WAREHOUSE"]),
  listing_type: z.enum(["RENT", "SALE"]),
  price: z.number().min(1000, "Price must be at least 1,000"),
  caution_deposit: z.number().min(0).optional(),
  total_sale_price: z.number().min(1000).optional(),
  minimum_holding_fee: z.number().min(1000).optional(),
  mandate_type: z.enum(["EXCLUSIVE", "SHARED"]),
  mandate_document_url: z.string().min(1, "Mandate document is required"),
  address: z.string().min(10, "Please enter a valid full address"),
  city: z.string().min(2),
  state: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  bedrooms: z.number().min(0).optional().nullable(),
  bathrooms: z.number().min(0).optional().nullable(),
  square_feet: z.number().min(0).optional().nullable(),
  year_built: z.number().min(1800).optional().nullable(),
  amenities: z.string().optional(),
  images: z.array(z.string()).min(1, "Please upload at least one image"),
});

const PROPERTY_TYPE_OPTIONS = [
  { id: "APARTMENT", label: "Apartment" },
  { id: "SELF_CONTAIN", label: "Self-Contain" },
  { id: "TERRACE", label: "Terrace" },
  { id: "DUPLEX", label: "Duplex" },
  { id: "OFFICE", label: "Office Space" },
  { id: "COMMERCIAL", label: "Commercial" },
  { id: "WAREHOUSE", label: "Warehouse" },
];

const LISTING_TYPE_OPTIONS = [
  { id: "RENT", label: "For Rent" },
  { id: "SALE", label: "For Sale" },
];

const MANDATE_TYPE_OPTIONS = [
  { id: "EXCLUSIVE", label: "Exclusive Mandate" },
  { id: "SHARED", label: "Shared Mandate" },
];

type PropertyFormData = z.infer<typeof propertySchema>;

// Dynamically import map to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/properties/location-picker"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-white/5 rounded-2xl animate-pulse" />
});

const steps = [
  { id: 1, title: "Basics", icon: Building2, fields: ["title", "description", "property_type", "listing_type", "bedrooms", "bathrooms", "square_feet", "year_built"] },
  { id: 2, title: "Amenities", icon: CheckCircle2, fields: ["amenities"] },
  { id: 3, title: "Pricing", icon: Currency, fields: ["price", "caution_deposit", "total_sale_price", "minimum_holding_fee"] },
  { id: 4, title: "Location", icon: MapPin, fields: ["address", "latitude", "longitude"] },
  { id: 5, title: "Media", icon: ImageIcon, fields: ["images", "mandate_document_url"] },
];

type CreatedProperty = {
  id: string;
  title: string;
};

export default function NewPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProperty, setCreatedProperty] = useState<{ id: string, title: string } | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [uploading, setUploading] = useState<'image' | 'document' | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      property_type: "APARTMENT",
      listing_type: "RENT",
      mandate_type: "EXCLUSIVE",
      city: "Lagos",
      state: "Lagos",
      latitude: 6.5244,
      longitude: 3.3792,
      images: [],
      price: 0,
      caution_deposit: 0,
      bedrooms: null,
      bathrooms: null,
      square_feet: null,
      year_built: null,
      amenities: "",
    }
  });

  const formData = watch();
  const watchedAmenities = watch("amenities") || "";

  const handleNext = async () => {
    const fieldsToValidate = steps.find(s => s.id === step)?.fields as FieldPath<PropertyFormData>[];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(prev => prev + 1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const endpoint = type === 'image' ? "/upload/image" : "/upload/document";
      const res = await api.post<{ url: string }>(endpoint, uploadFormData);

      if (type === 'image') {
        setValue("images", [...formData.images, res.url], { shouldValidate: true });
      } else {
        setValue("mandate_document_url", res.url, { shouldValidate: true });
      }
      toast.success(`${type === 'image' ? 'Image' : 'Document'} uploaded!`);
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed. Please check your connection.");
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post<CreatedProperty>(ENDPOINTS.PROPERTIES.BASE, data);
      setCreatedProperty({ id: res.id, title: res.title });
      setIsSuccess(true);
      toast.success("Listing published successfully!");
    } catch (err) {
      console.error("Failed to create listing", err);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="text-center animate-in zoom-in duration-500 max-w-md">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(193,155,118,0.2)]">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight font-heading text-white">Listing Published!</h1>
          <p className="text-gray-500 mb-10 leading-relaxed font-light">Your property is now live. Ready to assign an Agent to handle this asset?</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-black px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Assign Agent Now
            </button>
            <button
              onClick={() => router.push("/owner/properties")}
              className="text-gray-400 hover:text-white font-bold transition-all py-2 text-sm"
            >
              Skip and go to Portfolio
            </button>
          </div>

          {createdProperty && (
            <AssignAgentModal
              isOpen={isAssignModalOpen}
              onClose={() => setIsAssignModalOpen(false)}
              propertyId={createdProperty.id}
              propertyName={createdProperty.title}
              onSuccess={() => router.push("/owner/properties")}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-0 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-heading mb-2">List New Property</h1>
        <p className="text-gray-500 font-light">Complete the steps below to showcase your asset to the world.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 sm:mb-12 overflow-x-auto pb-3">
      <div className="flex min-w-[520px] justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -z-10 -translate-y-1/2"></div>
        {steps.map((s) => (
          <div
            key={s.id}
            className={cn(
              "flex flex-col items-center gap-2 px-4 bg-background transition-all duration-500",
              step >= s.id ? "text-primary" : "text-gray-600"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all",
              step >= s.id ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(193,155,118,0.1)]" : "border-white/10 bg-white/5"
            )}>
              <s.icon size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{s.title}</span>
          </div>
        ))}
      </div>
      </div>

      {/* Form Content */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-8 md:p-12 backdrop-blur-xl">

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Property Title</label>
                <input
                  {...register("title")}
                  placeholder="e.g., Luxury 3 Bedroom Penthouse"
                  className={cn(
                    "w-full bg-white/5 border rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all",
                    errors.title ? "border-red-500/50" : "border-white/10"
                  )}
                />
                {errors.title && <p className="text-[10px] text-red-500 font-bold pl-4 uppercase tracking-tighter">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Property Type</label>
                <CustomSelect
                  value={formData.property_type}
                  onChange={(value) => setValue("property_type", value as PropertyFormData["property_type"], { shouldValidate: true })}
                  options={PROPERTY_TYPE_OPTIONS}
                  icon={<Building2 size={15} />}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Listing Purpose</label>
                <CustomSelect
                  value={formData.listing_type}
                  onChange={(value) => setValue("listing_type", value as PropertyFormData["listing_type"], { shouldValidate: true })}
                  options={LISTING_TYPE_OPTIONS}
                  icon={<Currency size={15} />}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Detailed Description</label>
                <textarea
                  {...register("description")}
                  placeholder="Tell potential tenants about the unique features..."
                  className={cn(
                    "w-full bg-white/5 border rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all min-h-[100px]",
                    errors.description ? "border-red-500/50" : "border-white/10"
                  )}
                />
                {errors.description && <p className="text-[10px] text-red-500 font-bold pl-4 uppercase tracking-tighter">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-2 pt-4 border-t border-white/5 mt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-2">Bedrooms</label>
                  <input type="number" {...register("bedrooms", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary/50 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-2">Bathrooms</label>
                  <input type="number" {...register("bathrooms", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary/50 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-2">Sq Ft</label>
                  <input type="number" {...register("square_feet", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary/50 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-2">Year Built</label>
                  <input type="number" {...register("year_built", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary/50 text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Amenities */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Swimming Pool", "Gym", "Fiber Internet", "24/7 Security", "Solar Power", "Elevator", "Parking", "CCTV", "Lounge", "Smart Home", "Garden", "Boy's Quarters"].map((item) => {
                const currentAmenities = watchedAmenities.split(",").filter(Boolean);
                const isSelected = currentAmenities.includes(item);
                
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      const newAmenities = isSelected 
                        ? currentAmenities.filter(a => a !== item)
                        : [...currentAmenities, item];
                      setValue("amenities", newAmenities.join(","));
                    }}
                    className={cn(
                      "p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all text-center",
                      isSelected ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(193,155,118,0.2)]" : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.listing_type === "RENT" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Annual Rent (₦)</label>
                    <input
                      type="number"
                      {...register("price", { valueAsNumber: true })}
                      placeholder="5,000,000"
                      className={cn(
                        "w-full bg-white/5 border rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all",
                        errors.price ? "border-red-500/50" : "border-white/10"
                      )}
                    />
                    {errors.price && <p className="text-[10px] text-red-500 font-bold pl-4 uppercase tracking-tighter">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Caution Deposit (₦)</label>
                    <input
                      type="number"
                      {...register("caution_deposit", { valueAsNumber: true })}
                      placeholder="500,000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Total Sale Price (₦)</label>
                    <input
                      type="number"
                      {...register("price", { valueAsNumber: true })}
                      placeholder="50,000,000"
                      className={cn(
                        "w-full bg-white/5 border rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all",
                        errors.price ? "border-red-500/50" : "border-white/10"
                      )}
                    />
                    {errors.price && <p className="text-[10px] text-red-500 font-bold pl-4 uppercase tracking-tighter">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Reservation Deposit (NGN)</label>
                    <input
                      type="number"
                      {...register("minimum_holding_fee", { valueAsNumber: true })}
                      placeholder="1,000,000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <p className="text-[10px] text-gray-500 italic pl-4">Amount required to reserve this property.</p>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem]">
              <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} /> {formData.listing_type === "RENT" ? "Total Package Automation" : "Reservation Review Flow"}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {formData.listing_type === "RENT" 
                  ? "Our system will automatically calculate the Agency Fee (10%) and Legal Fee (10%)."
                  : "Sale buyers pay a reservation deposit first. The property moves to review before any owner or agent marks it sold."}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Full Address</label>
              <input
                {...register("address")}
                placeholder="123 Luxury Lane, Victoria Island"
                className={cn(
                  "w-full bg-white/5 border rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all",
                  errors.address ? "border-red-500/50" : "border-white/10"
                )}
              />
              {errors.address && <p className="text-[10px] text-red-500 font-bold pl-4 uppercase tracking-tighter">{errors.address.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4 font-heading">Pin Location on Map</label>
              <LocationPicker
                lat={formData.latitude}
                lng={formData.longitude}
                onChange={(lat, lng, address) => {
                  setValue("latitude", lat);
                  setValue("longitude", lng);
                  if (address) {
                    // Try to preserve house number if it exists at start of current address
                    const houseNumber = formData.address?.match(/^(\d+[a-zA-Z]?)\s/)?.[1];
                    const newAddress = houseNumber ? `${houseNumber}, ${address}` : address;
                    setValue("address", newAddress, { shouldValidate: true });
                  }
                }}
              />
              <p className="text-[10px] text-gray-500 italic pl-4">Click anywhere on the map to set coordinates.</p>
            </div>
          </div>
        )}

        {/* Step 5: Media */}
        {step === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4 flex justify-between">
                Property Images
                <span className="text-primary">{formData.images.length} added</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative group">
                    <img src={img} alt="Property" className="w-full h-full object-cover" />
                  </div>
                ))}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white/5 group">
                  {uploading === 'image' ? <Loader2 className="animate-spin text-primary" /> : (
                    <>
                      <input type="file" hidden onChange={(e) => handleFileUpload(e, 'image')} accept="image/*" />
                      <ImageIcon size={24} className="text-gray-500 group-hover:text-primary" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase text-center px-2">Add Photo</span>
                    </>
                  )}
                </label>
              </div>
              {errors.images && <p className="text-[10px] text-red-500 font-bold pl-4 uppercase tracking-tighter">{errors.images.message}</p>}
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Mandate Type & Document</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomSelect
                  value={formData.mandate_type}
                  onChange={(value) => setValue("mandate_type", value as PropertyFormData["mandate_type"], { shouldValidate: true })}
                  options={MANDATE_TYPE_OPTIONS}
                  icon={<FileText size={15} />}
                />
                <label className={cn(
                  "w-full bg-white/5 border rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-all",
                  errors.mandate_document_url ? "border-red-500/50" : "border-white/10"
                )}>
                  {uploading === 'document' ? <Loader2 className="animate-spin text-primary" /> : (
                    <>
                      <input type="file" hidden onChange={(e) => handleFileUpload(e, 'document')} accept=".pdf,.doc,.docx" />
                      <FileText size={18} className={cn(formData.mandate_document_url ? "text-green-500" : "text-primary")} />
                      <span className="text-sm font-medium">
                        {formData.mandate_document_url ? "Document Ready" : "Upload Mandate PDF"}
                      </span>
                    </>
                  )}
                </label>
              </div>
              {errors.mandate_document_url && <p className="text-[10px] text-red-500 font-bold pl-4 uppercase tracking-tighter">{errors.mandate_document_url.message}</p>}
            </div>
          </div>
        )}

        {/* Global Errors */}
        {Object.keys(errors).length > 0 && step === 5 && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-in fade-in">
            <AlertCircle size={18} />
            <p className="text-xs font-bold uppercase tracking-widest">Please fix the highlighted errors before publishing.</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-all font-bold px-6 py-2"
            >
              <ArrowLeft size={18} /> Previous
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="bg-primary hover:bg-primary-hover text-black px-10 py-4 rounded-full font-bold transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(193,155,118,0.2)]"
            >
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-hover text-black px-12 py-4 rounded-full font-bold transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(193,155,118,0.2)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Publish Listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
