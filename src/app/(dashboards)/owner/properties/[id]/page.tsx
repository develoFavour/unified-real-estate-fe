"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { PropertyDetailsView } from "@/components/properties/property-details-view";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function OwnerPropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await api.get<any>(ENDPOINTS.PROPERTIES.GET_ONE(id));
        setProperty(data);
      } catch (err) {
        setError("Could not find this property asset. It may have been moved or deleted.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6 text-gray-500 animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm font-bold tracking-widest uppercase">Fetching Asset Data...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-500 max-w-xs mx-auto font-light">{error}</p>
        </div>
        <Link href="/owner/properties" className="text-primary font-bold hover:underline">
          Return to Portfolio &rarr;
        </Link>
      </div>
    );
  }

  return <PropertyDetailsView property={property} backUrl="/owner/properties" />;
}
