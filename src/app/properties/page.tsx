"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bath,
  BedDouble,
  Building2,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Square,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { api } from "@/lib/api/methods";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";
import { PublicPageActions } from "@/components/shared/public-page-actions";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  mandate_type: string;
  listing_type: string;
  property_type: string;
  status: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  square_feet?: number | null;
  images: { image_url: string }[];
}

const PROPERTY_CATEGORIES = [
  { id: "", label: "All Properties" },
  { id: "APARTMENT", label: "Apartment" },
  { id: "TERRACE", label: "Terrace" },
  { id: "DUPLEX", label: "Duplex" },
  { id: "OFFICE", label: "Office" },
  { id: "COMMERCIAL", label: "Commercial" },
];

const LISTING_OPTIONS = [
  { id: "", label: "Any Purpose" },
  { id: "RENT", label: "Rent" },
  { id: "SALE", label: "Sale" },
];

const STATUS_OPTIONS = [
  { id: "", label: "Any Status" },
  { id: "AVAILABLE", label: "Available" },
  { id: "RESERVED", label: "Reserved" },
  { id: "RENTED", label: "Rented" },
  { id: "SOLD", label: "Sold" },
];

const BEDROOM_OPTIONS = [
  { id: "", label: "Any Bedrooms" },
  { id: "1", label: "1+ Bedroom" },
  { id: "2", label: "2+ Bedrooms" },
  { id: "3", label: "3+ Bedrooms" },
  { id: "4", label: "4+ Bedrooms" },
  { id: "5", label: "5+ Bedrooms" },
];

const PRICE_OPTIONS = [
  { id: "", label: "Any Budget" },
  { id: "0-500000", label: "Under NGN 500k" },
  { id: "500000-1500000", label: "NGN 500k - 1.5m" },
  { id: "1500000-5000000", label: "NGN 1.5m - 5m" },
  { id: "5000000-15000000", label: "NGN 5m - 15m" },
  { id: "15000000-", label: "NGN 15m+" },
];

const getPriceRange = (range: string) => {
  if (!range) return {};
  const [min, max] = range.split("-");
  return {
    min_price: min ? Number(min) : undefined,
    max_price: max ? Number(max) : undefined,
  };
};

const formatPropertyType = (value: string) => {
  if (!value) return "Property";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [listingType, setListingType] = useState("");
  const [status, setStatus] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const filterParams = useMemo(() => {
    const price = getPriceRange(priceRange);
    return {
      search: debouncedSearch || undefined,
      property_type: category || undefined,
      listing_type: listingType || undefined,
      status: status || undefined,
      bedrooms: bedrooms || undefined,
      min_price: price.min_price,
      max_price: price.max_price,
      limit: 100,
    };
  }, [bedrooms, category, debouncedSearch, listingType, priceRange, status]);

  useEffect(() => {
    let isMounted = true;

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const data = await api.get<Property[]>(ENDPOINTS.PROPERTIES.BASE, filterParams);
        if (isMounted) {
          setProperties(data || []);
          setVisibleCount(9);
          setHasLoadedOnce(true);
        }
      } catch {
        if (isMounted) toast.error("Failed to load properties.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProperties();
    return () => {
      isMounted = false;
    };
  }, [filterParams]);

  const visibleProperties = properties.slice(0, visibleCount);
  const activeFilterCount = [category, listingType, status, bedrooms, priceRange].filter(Boolean).length;

  const resetFilters = () => {
    setSearchQuery("");
    setCategory("");
    setListingType("");
    setStatus("");
    setBedrooms("");
    setPriceRange("");
  };

  if (loading && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="pt-32 pb-16 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="mb-10 flex justify-end">
          <PublicPageActions />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <h3 className="text-primary text-xs font-bold tracking-[0.3em] uppercase">Premium Listings</h3>
            <h1 className="text-5xl md:text-6xl font-bold font-heading">Explore Extraordinary Homes</h1>
            <p className="max-w-xl text-sm text-gray-500 leading-relaxed">
              Search by estate, street, city, state, or property title and narrow results by rent, sale, budget, bedrooms, and availability.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search location, title..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(prev => !prev)}
              className={cn(
                "relative p-3 border rounded-full transition-colors",
                showFilters || activeFilterCount > 0
                  ? "bg-primary text-black border-primary"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              )}
              aria-label="Toggle property filters"
            >
              <SlidersHorizontal className={cn("w-5 h-5", showFilters || activeFilterCount > 0 ? "text-black" : "text-gray-300")} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-12 overflow-x-auto pb-4 scrollbar-hide">
          {PROPERTY_CATEGORIES.map((cat) => (
            <button
              key={cat.id || "all"}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                category === cat.id
                  ? "bg-primary text-black border-primary"
                  : "bg-transparent text-gray-400 border-white/10 hover:border-white/20"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 md:p-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Refine Search</h2>
                <p className="mt-1 text-xs text-gray-500">Tune the public listings without leaving the page.</p>
              </div>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-gray-400 transition hover:border-primary/40 hover:text-primary"
              >
                <X size={14} /> Clear
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <CustomSelect value={listingType} onChange={setListingType} options={LISTING_OPTIONS} label="Purpose" icon={null} />
              <CustomSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} label="Availability" icon={null} />
              <CustomSelect value={bedrooms} onChange={setBedrooms} options={BEDROOM_OPTIONS} label="Bedrooms" icon={null} />
              <CustomSelect value={priceRange} onChange={setPriceRange} options={PRICE_OPTIONS} label="Budget" icon={null} />
            </div>
          </div>
        )}
      </section>

      <section className="py-12 px-8 md:px-16 max-w-7xl mx-auto mb-24">
        {loading && hasLoadedOnce ? (
          <div className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating listings
          </div>
        ) : null}

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {visibleProperties.map((property) => (
              <Link
                href={`/properties/${property.id}`}
                key={property.id}
                className="group flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[0].image_url}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <Building2 size={64} className="opacity-20" />
                    </div>
                  )}

                  <div className="absolute top-6 left-6 z-10 flex gap-2">
                    <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter">
                      {property.status}
                    </span>
                    <span className="bg-primary text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-xl">
                      {property.listing_type}
                    </span>
                  </div>

                  <div className="absolute top-6 right-6 z-10">
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        toast.success("Property bookmarked!");
                      }}
                      className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all"
                    >
                      <Heart size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-2xl font-bold font-heading text-white group-hover:text-primary transition-colors line-clamp-1">
                        {property.title}
                      </h4>
                      <p className="text-xl font-bold font-heading text-primary whitespace-nowrap">
                        NGN {property.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="line-clamp-1">
                        {property.address}, {property.city}{property.state ? `, ${property.state}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-white/5 flex justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-black uppercase text-primary/70">
                        {formatPropertyType(property.property_type)}
                      </span>
                      {property.bedrooms ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-500"><BedDouble size={12} /> {property.bedrooms}</span>
                      ) : null}
                      {property.bathrooms ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-500"><Bath size={12} /> {property.bathrooms}</span>
                      ) : null}
                      {property.square_feet ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-500"><Square size={12} /> {property.square_feet.toLocaleString()}</span>
                      ) : null}
                    </div>
                    <div className="w-10 h-10 shrink-0 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem]">
            <Building2 className="w-16 h-16 text-white/5 mx-auto mb-6" />
            <p className="text-gray-500 font-light">No properties found. Try another location or clear a filter.</p>
          </div>
        )}

        {properties.length > visibleCount && (
          <div className="mt-20 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 9)}
              className="bg-white/5 border border-white/10 px-12 py-4 rounded-full text-sm font-semibold hover:bg-white/10 transition-all text-gray-300"
            >
              Load More Properties
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
